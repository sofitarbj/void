/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { Color, RGBA } from '../../../../../base/common/color.js';
import { registerColor } from '../../../../../platform/theme/common/colorUtils.js';

// editCodeService colors
const sweepBG = new Color(new RGBA(100, 100, 100, .2));
const highlightBG = new Color(new RGBA(100, 100, 100, .1));
const sweepIdxBG = new Color(new RGBA(100, 100, 100, .5));

const acceptBGDark = new Color(new RGBA(69, 249, 156, .15));
const acceptBGLight = new Color(new RGBA(155, 185, 85, .15));

const rejectBGDark = new Color(new RGBA(248, 113, 113, .15));
const rejectBGLight = new Color(new RGBA(255, 0, 0, .15));

// Widget colors
export const acceptAllBg = '#00DC82';
export const acceptBg = '#00DC82';
export const acceptBorder = '1px solid #00391d';

export const rejectAllBg = '#1F1418';
export const rejectBg = '#1F1418';
export const rejectBorder = '1px solid #4A1B22';

export const buttonFontSize = '11px';
export const buttonTextColor = 'white';



const configOfBG = (color: Color) => {
	return { dark: color, light: color, hcDark: color, hcLight: color, };
};

// gets converted to --vscode-void-greenBG, see void.css, asCssVariable
registerColor('void.greenBG', { dark: acceptBGDark, light: acceptBGLight, hcDark: acceptBGDark, hcLight: acceptBGLight }, '', true);
registerColor('void.redBG', { dark: rejectBGDark, light: rejectBGLight, hcDark: rejectBGDark, hcLight: rejectBGLight }, '', true);
registerColor('void.sweepBG', configOfBG(sweepBG), '', true);
registerColor('void.highlightBG', configOfBG(highlightBG), '', true);
registerColor('void.sweepIdxBG', configOfBG(sweepIdxBG), '', true);

