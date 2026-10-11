import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { SkillDefinition, SkillMetadata } from '../common/skillServiceTypes.js';

export interface ISkillService {
	readonly _serviceBrand: undefined;
	getAvailableSkills(): SkillMetadata[];
	getSkillByName(name: string): SkillDefinition | undefined;
	findMatchingSkills(userMessage: string): SkillMetadata[];
	addSkill(skill: SkillDefinition): void;
	removeSkill(name: string): void;
}
export const ISkillService = createDecorator<ISkillService>('skillService');

const BUNDLED_SKILLS: SkillDefinition[] = [
	{ name: 'frontend-design', description: 'Premium frontend interfaces with modern design.', triggers: ['build web', 'create page', 'design UI', 'landing page', 'dashboard', 'component', 'frontend', 'website', 'React', 'CSS', 'Tailwind'], content: '## Frontend Design\n1. Use existing CSS framework. 2. Apply premium aesthetics (gradients, micro-animations). 3. Modern typography (Inter, Roboto). 4. Responsive mobile-first. 5. Semantic HTML5. 6. Keep components reusable.', source: 'bundled' },
	{ name: 'clean-code', description: 'Clean, maintainable code principles.', triggers: ['refactor', 'clean up', 'code quality', 'readable', 'maintainable'], content: '## Clean Code\n1. Functions do ONE thing. 2. Descriptive names. 3. Short functions (<30 lines). 4. No magic numbers. 5. Handle errors explicitly. 6. DRY but don\'t over-abstract.', source: 'bundled' },
	{ name: 'debugging', description: 'Systematic debugging protocol.', triggers: ['debug', 'fix bug', 'error', 'crash', 'not working', 'broken'], content: '## Debugging\n1. Reproduce the error. 2. Isolate failing unit. 3. Read error/stack trace. 4. Form hypothesis. 5. Add logging to verify. 6. Fix root cause. 7. Test + check regressions.', source: 'bundled' },
	{ name: 'api-design', description: 'REST/GraphQL API best practices.', triggers: ['API', 'REST', 'GraphQL', 'endpoint', 'route', 'backend', 'server'], content: '## API Design\n1. Meaningful resource names. 2. Proper HTTP methods. 3. Appropriate status codes. 4. Pagination for lists. 5. Consistent error format. 6. Version your API. 7. Validate input. 8. Document with OpenAPI.', source: 'bundled' },
	{ name: 'testing', description: 'TDD and testing best practices.', triggers: ['test', 'TDD', 'unit test', 'integration test', 'jest', 'vitest', 'mocha'], content: '## Testing\n1. Write tests before implementation (TDD). 2. One behavior per test. 3. AAA: Arrange, Act, Assert. 4. Descriptive names. 5. Test edge cases. 6. Mock externals, not internals. 7. Fast, isolated, repeatable.', source: 'bundled' },
	{ name: 'security', description: 'OWASP security best practices.', triggers: ['security', 'auth', 'authentication', 'XSS', 'SQL injection', 'CSRF', 'password'], content: '## Security\n1. Validate/sanitize all input. 2. Parameterized queries. 3. bcrypt for passwords. 4. Principle of least privilege. 5. Escape output (XSS). 6. HTTPS everywhere. 7. Never expose secrets in logs/URLs.', source: 'bundled' },
	{ name: 'performance', description: 'Performance optimization patterns.', triggers: ['performance', 'optimize', 'slow', 'lazy', 'cache', 'memo'], content: '## Performance\n1. Lazy load components/routes. 2. Memoize expensive computations. 3. Debounce/throttle events. 4. Virtualize long lists. 5. Optimize images (WebP, lazy). 6. Code splitting. 7. Cache API responses.', source: 'bundled' },
];

class SkillService extends Disposable implements ISkillService {
	readonly _serviceBrand: undefined;
	private skills: SkillDefinition[] = [...BUNDLED_SKILLS];

	getAvailableSkills(): SkillMetadata[] {
		return this.skills.map(({ content, ...meta }) => meta);
	}

	getSkillByName(name: string): SkillDefinition | undefined {
		return this.skills.find(s => s.name === name);
	}

	findMatchingSkills(userMessage: string): SkillMetadata[] {
		const lower = userMessage.toLowerCase();
		return this.skills
			.filter(s => s.triggers.some(t => lower.includes(t.toLowerCase())))
			.map(({ content, ...meta }) => meta);
	}

	addSkill(skill: SkillDefinition): void {
		const existing = this.skills.findIndex(s => s.name === skill.name);
		if (existing >= 0) {
			this.skills[existing] = skill;
		} else {
			this.skills.push(skill);
		}
	}

	removeSkill(name: string): void {
		this.skills = this.skills.filter(s => s.name !== name);
	}
}

registerSingleton(ISkillService, SkillService, InstantiationType.Delayed);
