/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { isPathInWorkspace, PolicyEngine } from '../policyEngine.js';
// Création d'un dossier temporaire de test au sein du projet (workspace)
const workspaceDir = path.resolve('./src/vs/workbench/contrib/void/common/agent/test/mock_workspace');
if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
}
// Fichiers/dossiers de test physiques
const existingSubDir = path.join(workspaceDir, 'existing_folder');
if (!fs.existsSync(existingSubDir)) {
    fs.mkdirSync(existingSubDir);
}
const existingFile = path.join(existingSubDir, 'file.ts');
fs.writeFileSync(existingFile, 'console.log("hello");');
console.log('--- Début des tests unitaires de sécurité Codeen ---');
// ==========================================
// 1. Tests de la fonction isPathInWorkspace
// ==========================================
try {
    console.log('1. Tests de confinement de chemin (isPathInWorkspace)...');
    // Cas 1 : Fichier existant dans le workspace
    assert.strictEqual(isPathInWorkspace(existingFile, workspaceDir), true, 'Le fichier existant dans le workspace devrait être approuvé.');
    // Cas 2 : Dossier existant dans le workspace
    assert.strictEqual(isPathInWorkspace(existingSubDir, workspaceDir), true, 'Le dossier existant dans le workspace devrait être approuvé.');
    // Cas 3 : Fichier inexistant à créer dans un dossier existant du workspace
    const newFileInExistingFolder = path.join(existingSubDir, 'new_file.ts');
    assert.strictEqual(isPathInWorkspace(newFileInExistingFolder, workspaceDir), true, 'Un nouveau fichier dans un dossier existant devrait être approuvé.');
    // Cas 4 : Fichier inexistant à créer dans un dossier inexistant (imbriqué) du workspace
    const newFileInNewFolder = path.join(workspaceDir, 'new_folder', 'sub_folder', 'new_file.ts');
    assert.strictEqual(isPathInWorkspace(newFileInNewFolder, workspaceDir), true, 'Un nouveau fichier dans des sous-dossiers à créer devrait être approuvé.');
    // Cas 5 : Tentative d'échappement par traversée relative (../)
    const escapeRelativePath = path.join(workspaceDir, '..', '..', '..', 'package.json');
    assert.strictEqual(isPathInWorkspace(escapeRelativePath, workspaceDir), false, 'Une tentative d\'échappement relative (../) doit être refusée.');
    // Cas 6 : Chemin absolu à l'extérieur du workspace
    const absoluteOutsidePath = path.resolve('/');
    assert.strictEqual(isPathInWorkspace(absoluteOutsidePath, workspaceDir), false, 'Un chemin absolu hors workspace doit être refusé.');
    // Cas 7 : Fichier inexistant avec traversée malveillante tentant de tromper le parseur
    const malformedPath = path.join(workspaceDir, 'existing_folder', '..', '..', 'outside_file.ts');
    assert.strictEqual(isPathInWorkspace(malformedPath, workspaceDir), false, 'Un chemin malformé remontant au parent hors workspace doit être refusé.');
    console.log('   -> isPathInWorkspace : OK');
}
catch (err) {
    console.error('❌ Échec test isPathInWorkspace :', err);
    process.exit(1);
}
// ==========================================
// 2. Tests de la classe PolicyEngine
// ==========================================
try {
    console.log('2. Tests du moteur de politiques (PolicyEngine)...');
    const testPolicies = [
        // Règle 1 : Autorise globalement la lecture de fichiers
        {
            name: 'allow_read_file',
            tool: 'view_file',
            decision: 'APPROVE'
        },
        // Règle 2 : Refuse l'écriture de fichiers d'extension spécifique (.env)
        {
            name: 'deny_env_writing',
            tool: 'write_to_file',
            decision: 'DENY',
            when: (args) => args.filePath && args.filePath.endsWith('.env')
        },
        // Règle 3 : Autorise l'écriture de fichiers normaux dans le workspace
        {
            name: 'allow_write_workspace',
            tool: 'write_to_file',
            decision: 'APPROVE',
            when: (args) => args.filePath && isPathInWorkspace(args.filePath, workspaceDir)
        },
        // Règle 4 : Demande confirmation pour run_command
        {
            name: 'confirm_run_command',
            tool: 'run_command',
            decision: 'ASK_USER'
        },
        // Règle 5 : Règle MCP prefix wildcard (ex: git_tools/*)
        {
            name: 'allow_mcp_git',
            tool: 'git_tools/*',
            decision: 'APPROVE'
        }
    ];
    const engine = new PolicyEngine(testPolicies);
    // Cas A : view_file doit être autorisé
    assert.strictEqual(engine.evaluate('view_file', {}), 'APPROVE', 'view_file doit être approuvé.');
    // Cas B : write_to_file pour un fichier .env (déclenchant le DENY prioritaire)
    assert.strictEqual(engine.evaluate('write_to_file', { filePath: path.join(workspaceDir, '.env') }), 'DENY', 'L\'écriture de .env doit être bloquée (DENY).');
    // Cas C : write_to_file pour un fichier autorisé dans le workspace
    assert.strictEqual(engine.evaluate('write_to_file', { filePath: path.join(workspaceDir, 'app.ts') }), 'APPROVE', 'L\'écriture de fichier normal dans le workspace doit être approuvée.');
    // Cas D : write_to_file hors workspace (déclenchant le Fail-Closed par défaut car le prédicat APPROVE renvoie false)
    assert.strictEqual(engine.evaluate('write_to_file', { filePath: path.join(workspaceDir, '..', 'app.ts') }), 'DENY', 'L\'écriture hors workspace doit être rejetée par Fail-Closed.');
    // Cas E : run_command doit renvoyer ASK_USER
    assert.strictEqual(engine.evaluate('run_command', { CommandLine: 'npm test' }), 'ASK_USER', 'run_command doit demander confirmation (ASK_USER).');
    // Cas F : MCP tool correspondant au préfixe
    assert.strictEqual(engine.evaluate('git_tools/git_status', {}), 'APPROVE', 'Un outil MCP dans le prefix autorisé doit être approuvé.');
    // Cas G : Outil non spécifié dans les règles (Fail-Closed automatique)
    assert.strictEqual(engine.evaluate('dangerous_undefined_tool', {}), 'DENY', 'Un outil non répertorié doit être bloqué par défaut (Fail-Closed).');
    console.log('   -> PolicyEngine : OK');
}
catch (err) {
    console.error('❌ Échec test PolicyEngine :', err);
    process.exit(1);
}
// Nettoyage des fichiers physiques de test
try {
    fs.unlinkSync(existingFile);
    fs.rmdirSync(existingSubDir);
    fs.rmdirSync(workspaceDir);
}
catch (e) {
    // ignore
}
console.log('✨ Tous les tests unitaires de sécurité ont réussi avec succès ! ✨');
process.exit(0);
