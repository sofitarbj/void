---
name: Obsidian Precision
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#bacbbc'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#859587'
  outline-variant: '#3c4a3f'
  surface-tint: '#1ce388'
  primary: '#45f99c'
  on-primary: '#00391d'
  primary-container: '#00dc82'
  on-primary-container: '#005b32'
  inverse-primary: '#006d3e'
  secondary: '#a6e6ff'
  on-secondary: '#003543'
  secondary-container: '#14d1ff'
  on-secondary-container: '#00566b'
  tertiary: '#d4dbff'
  on-tertiary: '#00287d'
  tertiary-container: '#adbeff'
  on-tertiary-container: '#0042c1'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#59ffa4'
  primary-fixed-dim: '#1ce388'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522d'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#4cd6ff'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b6c4ff'
  on-tertiary-fixed: '#00164f'
  on-tertiary-fixed-variant: '#003baf'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
  surface-base: '#0B0D11'
  surface-panel: '#12151B'
  surface-elevated: '#1A1E26'
  surface-hover: '#222732'
  border-subtle: '#242933'
  border-hairline: rgba(255, 255, 255, 0.08)
  border-active: '#00DC82'
  text-primary: '#F3F4F6'
  text-secondary: '#9CA3AF'
  text-muted: '#6B7280'
  agent-cyan: '#00D1FF'
  agent-indigo: '#2563FF'
  diff-addition: '#10B981'
  diff-deletion: '#EF4444'
  diff-addition-surface: rgba(16, 185, 129, 0.12)
  diff-deletion-surface: rgba(239, 68, 68, 0.12)
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Outfit
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Outfit
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Outfit
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 19px
  body-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-base:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11.5px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  meta-mono:
    fontFamily: JetBrains Mono
    fontSize: 10.5px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system defines a developer-first, AI-native Integrated Development Environment calibrated to the aesthetic restraint and precision standards of Apple, Linear, and Vercel. Engineered directly atop an extended VS Code foundation, the interface prioritizes cognitive clarity, minimal latency visual feedback, and technical authority.

The target audience consists of senior software engineers, systems architects, and AI engineers who demand uncompromising control, ergonomic clarity, and zero synthetic friction. The emotional posture is quiet, razor-sharp, and confident—rejecting cartoonish illustrations, excessive skeuomorphic noise, and gratuitous novelty gradients in favor of structural density, structural hairline framing, and calibrated micro-interactions.

The visual methodology fuses **Minimalism** with **High-Performance Technical Utility**:
- Obsidian-toned surface hierarchies that recede to let code and diff context dominate.
- An energetic, precision accent anchor in Radiant Emerald (#00DC82) extracted from the forward slash mark, balanced by Electric Cyan (#00D1FF) for multi-agent reasoning, streaming states, and telemetry.
- High-contrast, micro-tracked geometric typography pairing Outfit for human-computer interaction with JetBrains Mono for pristine syntax display.
- Exacting 1px structural hairline boundaries with controlled luminance values.

## Colors

The system operates strictly on a dark-first foundational architecture. Backgrounds rely on deep, spectral obsidian tones configured across discrete luminance layers rather than flat `#000000` pitch blacks, preserving spatial differentiation across docked panels, auxiliary sidebars, editors, and terminal panes.

### Roles & Semantic Allocation
- **Primary Brand Accent (`#00DC82` / Radiant Emerald)**: Used for high-intent operational triggers, selected tab indicators, successful diff approvals, and primary execution affordances. It represents forward progress and runtime health.
- **Secondary Accent (`#00D1FF` / Electric Cyan)**: Assigned strictly to agentic runtime telemetry—representing LLM thinking passes, dynamic context gathering, streaming states, and token gauges.
- **Tertiary Accent (`#2563FF` / Deep Indigo)**: Used in conjunction with Electric Cyan to visually isolate asynchronous deep background jobs, MCP (Model Context Protocol) tool execution, and structural terminal services.
- **Neutrals & Surfaces**:
  - `surface-base` (`#0B0D11`): Main editor buffer and workspace canvas.
  - `surface-panel` (`#12151B`): Primary sidebar, file tree, and bottom terminal dock.
  - `surface-elevated` (`#1A1E26`): Command bars, Quick Edit overlays (`Ctrl+K`), context floating chips, and tool execution blocks.
  - `border-subtle` (`#242933`) and `border-hairline` (`rgba(255, 255, 255, 0.08)`): Used for all panel dividers, maintaining structural cohesion without visually crowding dense code blocks.

## Typography

The typographic hierarchy distinguishes sharply between conversational natural language interfaces and machine execution tokens. 

- **Outfit** serves as the primary system typeface for all UI labels, navigation controls, command headers, AI dialog reasoning copy, and brand checkpoints. Its crisp geometric circularity, paired with tight negative tracking (`-0.015em` to `-0.04em`), provides an immediate contemporary feel reminiscent of next-generation developer tooling.
- **JetBrains Mono** anchors the computational tier: Monaco editor lines, inline git diff comparisons, AST tool arguments, keybinding chips, token telemetry counters, and command-line readouts.
- Capitalized section dividers (e.g., `EXPLORER`, `AGENT REASONING`, `MCP SERVERS`) leverage `label-caps` with wide letter-spacing (`0.06em`) to preserve legibility at micro scales.

## Layout & Spacing

Layout geometry follows an ultra-dense, docked workstation framework suited for multiple split editor buffers, sidebar utilities, auxiliary agent panes, and floating quick-action dialogs.

### Structural Model
- **Workstation Grid**: Non-scrolling shell viewports partitioned by strict 1px dividers rather than loose margin gaps. Resizable layout columns adhere to dynamic percentage or fixed-pixel panels (`Activity Bar: 48px`, `Primary Sidebar: 260px-340px`, `Auxiliary Agent Bar: 360px-440px`, `Status Bar: 24px`).
- **Internal Component Spacing**: Interfaces strictly adhere to a compact 4px base increment. Inputs, tool-call accordions, and list entries use `space-xs` (4px) to `space-sm` (8px) internal padding to preserve maximum vertical code real estate.
- **Viewport Scaling**:
  - *Desktop / Workstation (>= 1200px)*: Full 3-to-4 column display including tree explorer, multi-pane Monaco buffer, inline diff viewer, and real-time streaming agent feed.
  - *Compact Screen / Laptop (768px - 1199px)*: Auxiliary agent panel docks into a slide-over drawer; secondary tool call metadata contracts to icon badges.
  - *Constrained (< 768px)*: Single active panel mode with mobile bottom drawer switching between editor and agent prompt interface.

## Elevation & Depth

Depth in this design system is engineered through structural **Tonal Stacking** paired with **Hairline Micro-Borders** rather than muddy, diffused box-shadows.

1. **Layer 0 (Canvas Base - `#0B0D11`)**: The deepest foundational layer, reserved for the primary text buffer and Monaco editor lines.
2. **Layer 1 (Docked Containers - `#12151B`)**: Activity Bar, Auxiliary Chat Panel, Sidebars, Terminal shell, and Status Bar. Outlined against Layer 0 using a 1px solid border of `border-subtle` (`#242933`).
3. **Layer 2 (Embedded Surface Cards - `#1A1E26`)**: Tool call invocation widgets, collapsible reasoning blocks, inline chat inputs, and Fast Apply diff bars. Framed with a precise `rgba(255, 255, 255, 0.08)` hairline border.
4. **Layer 3 (Floating Overlays & Modals - `#1A1E26` + Blur)**: Command Palette (`Ctrl+P`), Quick Edit chat (`Ctrl+K`), and token usage diagnostics. These use an ambient 12px backdrop-filter blur (`backdrop-filter: blur(12px)`) combined with a directional 1px top highlight (`border-top: 1px solid rgba(255, 255, 255, 0.14)`) and an ultra-deep technical shadow: `0 16px 40px -8px rgba(0, 0, 0, 0.65)`.
5. **Micro-Glow Feedback**: High-value focus states (active agent streaming or focused quick-edit input) cast an ultra-tight, non-diffuse perimeter glow: `0 0 0 1px #00DC82, 0 0 12px rgba(0, 220, 130, 0.22)`.

## Shapes & Corner Geometry (Sharp Obsidian Rule)

The geometric silhouette across Codeen IDE is strictly disciplined, understated, sharp, and technical. **All interactive containers prioritize pointed, sharp corners (`rounded-sm` / max 2px)** over soft or rounded aesthetics (`rounded-lg`, `rounded-xl` are prohibited).

- **Strict Corner Radius (`rounded-sm` = 2px / 0.125rem)**: Standard across all buttons, input fields, modal containers, cards, tabs, and keybinding badges.
- **Micro Badges & Chips**: 2px radius (`rounded-sm`) or 0px flush joins.
- **Tabs & Panel Headers**: Flush 0px joins along bottom and side borders to ensure seamless panel docking without gaps or anti-aliasing artifacts.

## Official Brand Identity & Slogan

- **Source of Truth for Assets**: All brand assets MUST be loaded directly from the repository's `brand/` directory without manual vector re-creations:
  - Full Wordmark: `brand/codeenfull.png`
  - Identification Mark / Favicon / App Icon: `brand/codeenid.png` (raster) and `brand/codeenID.svg` (vector)
- **Official Brand Slogan**:
  > *"Un éditeur de code conçu spécialement pour les Africains"*

## Workbench Shell Architecture (Titlebar, Activity Bar, Statusbar)

Based on the official Stitch mockups (`scr_06_07_14_active_agent_fast_apply/code.html`), the native workbench chrome strictly adheres to:

### 1. Titlebar (Header Chrome)
- **Background**: `surface-panel` (`#12151B`), height 36px to 40px (`h-10`), subtle lower shadow `shadow-[0_1px_8px_rgba(0,0,0,0.4)]`.
- **Left**: Window controls + Codeen Wordmark (`Outfit` 15px font-semibold).
- **Center**: Quick-open search command bar (`h-7 bg-surface-elevated hover:bg-surface-hover border border-border-hairline rounded-sm px-3`), with search icon tinted in primary green on hover, placeholder *"Search files, symbols, commands"*, and micro-chips `Ctrl+P` / `⌘K` in `bg-surface-panel text-text-muted rounded-sm`.
- **Right**: Layout toggle controls (`dock_to_left`, `dock_to_bottom`, `dock_to_right`, `settings`) in `text-on-surface-variant hover:bg-surface-hover rounded-sm`.

### 2. Activity Bar (Navigation Strip)
- **Background**: `surface-panel` (`#12151B`), fixed width 48px (`w-12`), 1px right border `border-subtle` (`#242933`).
- **Active Navigation Item**:
  - Background: `bg-surface-elevated` (`#1A1E26`)
  - Accent Indicator: 2px solid left border in Emerald (`#00DC82`)
  - Icon color: `text-primary` (`#45f99c` / `#00dc82`)
- **Inactive Items**: `text-on-surface-variant` with smooth transition to `hover:bg-surface-hover hover:text-on-surface`.
- **Notification Badges**: High-contrast, sharp-cornered badges in `bg-primary text-surface-base font-semibold` or subtle pill tags (`border border-primary/30 bg-primary/10 text-primary`).

### 3. Status Bar (Footer Shell)
- **Background**: `surface-panel` (`#12151B`), height 24px (`h-6`), 1px top border `border-border-hairline`.
- **Typography & Details**: `JetBrains Mono` (`font-meta-mono` 10.5px / 11px), `text-text-secondary`.
- **Left Cluster**:
  - Git Branch: Emerald icon (`#00DC82`) with branch name (`main*`).
  - Diagnostic Errors & Warnings: Red (`#EF4444`) and Amber (`#F59E0B`) counters.
  - Codeen Agent Status: Pulsing Cyan/Emerald bolt indicator (`Codeen Agent: Idle / Running`).
- **Right Cluster**:
  - Live Token / Cost Counter: Elevated pill `bg-surface-elevated text-primary px-1.5 py-0.5 rounded-sm`.
  - Line/Col, Encodings, and Notifications.

## Components

### Buttons
- **Primary Action (Execute / Accept Diff)**: Solid `#00DC82` background, deep obsidian `#0B0D11` text, weight 600, sharp radius `rounded-sm` (2px). On hover, background shifts to `#59FFA4` with an immediate 100ms transition.
- **Secondary (Reject / Discard)**: Transparent fill, 1px solid `border-subtle`, `#9CA3AF` text, sharp radius `rounded-sm`. Hover state brightens to `surface-hover` (`#222732`) with `#F3F4F6` text.
- **Ghost Action**: Flush padding, `#6B7280` text, highlighting to `#F3F4F6` with an invisible bounding box until hovered.

### Fast Apply Diff Control Bars
- Inline bar pinned to the top of Monaco editor changes.
- Split layout: Left section displays file name and change stats (`+14 -2` in monospace green/red pill badges).
- Right section features tandem quick buttons: "Accept All (`⌘Enter`)" in emerald and "Reject (`⌘Backspace`)" in muted slate.
- Top and bottom boundaries utilize hairline 1px `rgba(255, 255, 255, 0.08)`.

### Agent Reasoning Blocks ("Thinking" Accordions)
- Collapsible container built on `surface-panel` with an inset hairline border.
- Header features an animated micro-indicator: an Electric Cyan (`#00D1FF`) pulse dot when active, transitioning to an Emerald check when execution finishes.
- Body text renders in `Outfit` 13px at 70% opacity (`#9CA3AF`), set with comfortable reading line-height.

### Tool Call Widgets (`read_file`, `terminal`, `mcp`, `edit`)
- Compact horizontal modules featuring a JetBrains Mono function header.
- Left edge features a 2px vertical semantic strip (Cyan for reading/context, Indigo for external MCP actions, Emerald for file edits).
- Status chip on the right displays duration (`142ms`) and status (e.g., `success`, `running`) in `meta-mono`.

### Inputs & Command Palette
- Input surfaces utilize `surface-elevated` with an inner 1px border `rgba(255, 255, 255, 0.08)` and sharp `rounded-sm` corners.
- When focused, transitions cleanly to a 1px border of `#00DC82` without a jarring layout shift.
- Placeholder copy rendered in `#6B7280`.

### Chips & Keyboard Badges
- Keybindings (e.g., `⌘K`, `Enter`) feature a subtle mono badge with `surface-panel` fill, 1px border `border-subtle`, 2px border-radius (`rounded-sm`), and 2px 5px micro-padding.