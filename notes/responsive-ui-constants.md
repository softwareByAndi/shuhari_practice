# Responsive UI Constants Reference

## Quick Reference Guide
Constants and patterns extracted from `/app/practice/math/equations/[type]/practice/page.tsx`

## Container Setup
```typescript
const MAX_CONTAINER_HEIGHT = 1600; // px
const CONTAINER_ASPECT_RATIO = 0.47; // width/height ratio

// Container styling
style={{
  height: `min(100vh, ${MAX_CONTAINER_HEIGHT}px)`,
  width: `min(100vw, ${MAX_CONTAINER_HEIGHT * CONTAINER_ASPECT_RATIO}px)`,
  maxHeight: `${MAX_CONTAINER_HEIGHT}px`,
  maxWidth: `${MAX_CONTAINER_HEIGHT * CONTAINER_ASPECT_RATIO}px`,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: '2% 4%',
}}
```

## Font Size Scale
```typescript
// Typography scale using calc(vw + vh)
const fontSizes = {
  // Display
  xxLarge: 'calc(2.5vw + 2.5vh)',  // Main problem display
  xLarge:  'calc(2vw + 2vh)',      // Answer display

  // Interactive
  large:   'calc(1.8vw + 1.8vh)',  // Numpad buttons, stats
  medium:  'calc(1.5vw + 1.5vh)',  // Section headers

  // Supporting
  normal:  'calc(1.3vw + 1.3vh)',  // Special buttons (Clear, +/-)
  small:   'calc(1vw + 1vh)',      // Feedback messages
  xSmall:  'calc(0.9vw + 0.9vh)',  // Progress labels

  // Metadata
  tiny:    'calc(0.8vw + 0.8vh)',  // Back links
  micro:   'calc(0.7vw + 0.7vh)',  // Stats labels
}
```

## Component Height Allocation
```typescript
const componentHeights = {
  header:       '8%',   // Navigation and title
  statsBar:     '8%',   // Session/Total reps display
  problemCard:  '59%',  // Main practice area
  progressBar:  '8%',   // Shu Ha Ri progress

  // Inside problem card
  problemDisplay: '15%', // Equation display
  answerField:    '12%', // Answer input display
  numpad:         'flex: 1', // Remaining space for buttons
}
```

## Spacing Scale
```typescript
const spacing = {
  // Margins
  marginTiny:   '0.5%',
  marginSmall:  '1%',
  marginMedium: '2%',
  marginLarge:  '3%',
  marginXLarge: '4%',

  // Gaps (grid/flex)
  gapSmall:  '2%',
  gapMedium: '4%',

  // Padding
  paddingSmall:  '1.5%',
  paddingMedium: '2%',
  paddingLarge:  '4%',
  paddingXLarge: '6%',
}
```

## Component Examples

### Stats Card
```typescript
<div style={{
  height: '8%',
  gap: '4%',
  marginBottom: '4%'
}}>
  <div className="..." style={{
    fontSize: 'calc(0.7vw + 0.7vh)' // Label
  }}>
  <div style={{
    fontSize: 'calc(1.8vw + 1.8vh)' // Value
  }}>
</div>
```

### Problem Display
```typescript
<div style={{
  height: '15%',
  marginBottom: '2%',
  fontSize: 'calc(2.5vw + 2.5vh)'
}}>
  {num1} {operator} {num2} = ?
</div>
```

### Numpad Button
```typescript
<button style={{
  fontSize: 'calc(1.8vw + 1.8vh)'
}}>
  {number}
</button>
```

### Progress Bar Container
```typescript
<div style={{
  height: '8%',
  padding: '1.5% 4%',
  marginTop: '4%'
}}>
  <h3 style={{ fontSize: 'calc(0.9vw + 0.9vh)' }}>
  <p style={{ fontSize: 'calc(0.7vw + 0.7vh)' }}>
  <div style={{ height: '25%' }}> // Progress bar track
</div>
```

## CSS Classes for Consistent Styling

### Border Radius
```css
.radius-card { border-radius: /* defined in CSS */ }
.radius-button { border-radius: /* defined in CSS */ }
.radius-modal { border-radius: /* defined in CSS */ }
```

### Text Styles (using dynamic sizing)
```css
.text-modal-emoji { /* calc(4vw + 4vh) equivalent */ }
.text-modal-title { /* calc(1.5vw + 1.5vh) equivalent */ }
.text-modal-text { /* calc(1vw + 1vh) equivalent */ }
.text-modal-small { /* calc(0.8vw + 0.8vh) equivalent */ }
.text-save-status { /* calc(0.7vw + 0.7vh) equivalent */ }
.text-banner { /* calc(0.9vw + 0.9vh) equivalent */ }
.text-back-link { /* calc(0.8vw + 0.8vh) equivalent */ }
```

### Spacing Classes
```css
.spacing-section-gap { /* Consistent section spacing */ }
.spacing-modal-padding { /* Modal internal padding */ }
.spacing-save-indicator-padding { /* Save status padding */ }
```

## Usage Template

```typescript
// New practice page template
export default function NewPracticePage() {
  // Constants
  const MAX_CONTAINER_HEIGHT = 1600;
  const CONTAINER_ASPECT_RATIO = 0.47;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <main
        style={{
          height: `min(100vh, ${MAX_CONTAINER_HEIGHT}px)`,
          width: `min(100vw, ${MAX_CONTAINER_HEIGHT * CONTAINER_ASPECT_RATIO}px)`,
          maxHeight: `${MAX_CONTAINER_HEIGHT}px`,
          maxWidth: `${MAX_CONTAINER_HEIGHT * CONTAINER_ASPECT_RATIO}px`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          padding: '2% 4%',
        }}
      >
        {/* Components with percentage-based heights */}
      </main>
    </div>
  );
}
```

## Testing Viewports

Recommended test dimensions:
- iPhone SE: 375 × 667
- iPhone 12: 390 × 844
- iPhone 14 Pro Max: 430 × 932
- iPad Mini: 768 × 1024
- iPad Pro 11": 834 × 1194
- iPad Pro 12.9": 1024 × 1366

## Conversion Formula

To convert existing px values:
1. For heights: `(px_value / typical_viewport_height) * 100`
2. For fonts: Start with `calc((px_value/16)vw + (px_value/16)vh)` and adjust
3. For spacing: Round to nearest percentage point (1%, 2%, 4%)