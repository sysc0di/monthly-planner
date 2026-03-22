# Monthly Planner - Specification

## Project Overview
- **Project Name**: Monthly Planner
- **Type**: Web Application (Next.js)
- **Core Functionality**: A monthly planning app with calendar view, time-slotted tasks, and to-do list style task management
- **Target Users**: Anyone wanting to plan and organize their monthly schedule

## UI/UX Specification

### Layout Structure
- **Header**: Current month/year display with navigation arrows, add task button
- **Main Content**: 
  - Calendar grid (7 columns for days of week)
  - Day cells showing date and assigned tasks
  - Click on day to expand time-slotted task view
- **Task Modal**: Slide-out panel for adding/editing tasks with time slots
- **Responsive Breakpoints**:
  - Mobile: < 640px (compact calendar, full-screen task view)
  - Tablet: 640px - 1024px (larger calendar cells)
  - Desktop: > 1024px (full calendar with hover previews)

### Visual Design
- **Color Palette**:
  - Primary: #6366F1 (Indigo)
  - Primary Light: #818CF8
  - Primary Dark: #4F46E5
  - Background: #0F172A (Dark slate)
  - Surface: #1E293B (Slate 800)
  - Surface Light: #334155 (Slate 700)
  - Text Primary: #F8FAFC (Slate 50)
  - Text Secondary: #94A3B8 (Slate 400)
  - Success: #10B981 (Emerald)
  - Border: #475569 (Slate 600)
- **Typography**:
  - Font: Inter (Google Fonts)
  - Headings: 28px (month title), 18px (day headers)
  - Body: 14px
  - Small: 12px (time slots)
- **Spacing**: 8px base unit
- **Effects**: 
  - Smooth transitions (200ms ease)
  - Glass-morphism effect on modal
  - Subtle hover elevation on calendar cells

### Components
1. **Calendar Header**: Month/year display with prev/next navigation
2. **Calendar Grid**: 7x6 grid for days of month
3. **Day Cell**: Date number, task count badge, mini task preview
4. **Task Modal**: Slide-out panel with time-slotted task list
5. **Task Item**: Checkbox, task title, time range, strikethrough on complete
6. **Add Task Form**: Input fields for title, start/end time, day selection
7. **Time Range Picker**: Minimal number inputs for hours and minutes (24-hour format)

## Functionality Specification

### Core Features
1. **Calendar Navigation**:
   - View any month
   - Navigate between months with arrows
   - Jump to current month

2. **Task Management**:
   - Create tasks with title and time range
   - Assign tasks to specific days
   - Mark tasks as completed (strikethrough effect)
   - Delete tasks
   - Edit existing tasks

3. **Time Slot System**:
   - Individual hour and minute selection (24-hour format)
   - Tasks have start and end time (e.g., 09:00 - 10:30)
   - Tasks sorted by start time in task list
   - Visual indicator for morning/afternoon/evening

4. **Data Persistence**:
   - All tasks stored in localStorage
   - Auto-save on every change
   - Data keyed by date

### User Interactions
- Click arrows to navigate months
- Click "Today" to return to current month
- Click "+" to open add task modal
- Click day cell to see all tasks for that day
- Click checkbox to complete/uncomplete task
- Completed tasks show strikethrough line

### Data Structure
```json
{
  "tasks": {
    "2026-03-22": [
      {
        "id": "task-uuid",
        "title": "Meeting with team",
        "startTime": "11:00",
        "endTime": "12:30",
        "completed": false,
        "createdAt": "2026-03-22T10:00:00Z"
      }
    ]
  }
}
```

## Acceptance Criteria
1. Calendar displays current month correctly
2. Can navigate between months
3. Can add tasks with title and time range (start/end)
4. Tasks appear on correct days with time range displayed
5. Completed tasks show strikethrough
6. Tasks persist after page refresh
7. Responsive on all device sizes
8. Smooth animations and transitions
