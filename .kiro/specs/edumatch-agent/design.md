# Design Specification

## 1. Layout Structure
- **Sidebar**: Categorical navigation and brand identity.
- **Top Header**: Search bar and global actions (Add Notice).
- **Status Dashboard**: KPI-style aggregate status filters.
- **Main Grid**: Responsive card-based layout (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).

## 2. Visual Identity
- **Color Palette**:
    - Primary: Indigo-600 (Action/Brand)
    - Background: Slate-50 (Neutral)
    - Status: Emerald (Success), Rose (Conflict), Amber (Warning).
- **Typography**: San-serif (Inter/system-ui) with heavy weights for headings.

## 3. Interactions
- Use `framer-motion` for staggered entrance of grid items.
- Backdrop blur effects for modals to maintain context.
- Hover scaling on cards to indicate interactivity.
