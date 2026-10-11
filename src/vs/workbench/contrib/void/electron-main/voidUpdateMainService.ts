/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IEnvironmentMainService } from '../../../../platform/environment/electron-main/environmentMainService.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IUpdateService, StateType } from '../../../../platform/update/common/update.js';
import { IVoidUpdateService } from '../common/voidUpdateService.js';
import { VoidCheckUpdateRespose } from '../common/voidUpdateServiceTypes.js';



export class VoidMainUpdateService extends Disposable implements IVoidUpdateService {
	_serviceBrand: undefined;

	constructor(
		@IProductService private readonly _productService: IProductService,
		@IEnvironmentMainService private readonly _envMainService: IEnvironmentMainService,
		@IUpdateService private readonly _updateService: IUpdateService,
	) {
		super()
	}


	async check(explicit: boolean): Promise<VoidCheckUpdateRespose> {

		const isDevMode = !this._envMainService.isBuilt // found in abstractUpdateService.ts

		if (isDevMode) {
			return { message: null } as const
		}

		// if disabled and not explicitly checking, return early
		if (this._updateService.state.type === StateType.Disabled) {
			if (!explicit)
				return { message: null } as const
		}

		this._updateService.checkForUpdates(false) // implicity check, then handle result ourselves

		console.log('updateState', this._updateService.state)

		if (this._updateService.state.type === StateType.Uninitialized) {
			// The update service hasn't been initialized yet
			return { message: explicit ? 'Checking for updates soon...' : null, action: explicit ? 'reinstall' : undefined } as const
		}

		if (this._updateService.state.type === StateType.Idle) {
			// No updates currently available
			return { message: explicit ? 'No updates found!' : null, action: explicit ? 'reinstall' : undefined } as const
		}

		if (this._updateService.state.type === StateType.CheckingForUpdates) {
			// Currently checking for updates
			return { message: explicit ? 'Checking for updates...' : null } as const
		}

		if (this._updateService.state.type === StateType.AvailableForDownload) {
			// Update available but requires manual download (mainly for Linux)
			return { message: 'A new update is available!', action: 'download', } as const
		}

		if (this._updateService.state.type === StateType.Downloading) {
			// Update is currently being downloaded
			return { message: explicit ? 'Currently downloading update...' : null } as const
		}

		if (this._updateService.state.type === StateType.Downloaded) {
			// Update has been downloaded but not yet ready
			return { message: explicit ? 'An update is ready to be applied!' : null, action: 'apply' } as const
		}

		if (this._updateService.state.type === StateType.Updating) {
			// Update is being applied
			return { message: explicit ? 'Applying update...' : null } as const
		}

		if (this._updateService.state.type === StateType.Ready) {
			// Update is ready
			return { message: 'Restart Void to update!', action: 'restart' } as const
		}

		if (this._updateService.state.type === StateType.Disabled) {
			return await this._manualCheckGHTagIfDisabled(explicit)
		}
		return null
	}






	private async _manualCheckGHTagIfDisabled(explicit: boolean): Promise<VoidCheckUpdateRespose> {
		try {
			const response = await fetch('https://api.github.com/repos/sofitarbj/void/releases/latest');

			const data = await response.json();
			const version = data.tag_name;

			const myVersion = this._productService.version;
			const latestVersion = version;

			const isUpToDate = myVersion === latestVersion;

			let message: string | null;
			let action: 'reinstall' | undefined;

			// explicit
			if (explicit) {
				if (response.ok) {
					if (!isUpToDate) {
						message = `Une nouvelle version de Codeen (${latestVersion}) est disponible ! Téléchargez la mise à jour depuis GitHub.`;
						action = 'reinstall';
					} else {
						message = 'Codeen IDE est à jour !';
					}
				} else {
					message = `Impossible de récupérer la dernière release Codeen sur GitHub. Réessayez dans quelques instants.`;
					action = 'reinstall';
				}
			}
			// not explicit
			else {
				if (response.ok && !isUpToDate) {
					message = `Une nouvelle version de Codeen (${latestVersion}) est disponible !`;
					action = 'reinstall';
				} else {
					message = null;
				}
			}
			return { message, action } as const;
		} catch (e) {
			if (explicit) {
				return {
					message: `Erreur lors de la vérification des mises à jour : ${e}.`,
					action: 'reinstall',
				};
			} else {
				return { message: null } as const;
			}
		}
	}
}
