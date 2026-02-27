# Secret Santa Application

## Overview
A Secret Santa gift exchange application with name-based authentication, two-stage workflow, and admin controls accessible only to the participant with the oldest registration date (the last participant in the list, determined by the maximum registrationTime field stored in backend profile data).

## Authentication
- Name-based login without passwords
- Only the participant with the oldest registration date (determined by maximum registrationTime field stored in backend profile data) has access to admin features and controls
- Admin access is determined by comparing the logged-in user's principal with the principal of the participant who has the maximum registrationTime field in backend profile data
- After login and on any profile or participant list update, the system checks if the logged-in user's principal matches the principal of the participant with the maximum registrationTime to determine admin access
- Proper logout flow that returns users to the registration (login) page
- Logout button displays only a power off icon without any text

## Sign Up Page
- Login button displays "Sign up" text
- No Internet Identity messaging displayed
- No "Join the festive fun!" message displayed on the login page
- No "welcome user name" message displayed in the login header

## Language Selector
- Language selector button is positioned immediately to the left of the power (logout) icon in the header, ensuring both are aligned and clearly visible
- When clicked, displays a small horizontal panel to the left of the icon showing only country flag icons for each available language (Spanish, English, and French)
- Panel is always fully visible and overlays other UI elements if needed with high z-index value
- Users can select their preferred language by clicking the corresponding country flag in the panel
- Panel closes when a language is selected or when clicking outside the panel area
- High z-index value ensures the panel is never partially hidden behind any other interface elements, cards, or components on any page
- Proper positioning and layering to maintain visibility above all content on every page including the user profile page, admin dashboard, and all other interface sections
- Panel interaction functionality remains unobstructed by any underlying UI elements across all pages
- Consistent panel behavior and appearance throughout the entire application
- All app text and UI elements update instantly when a language is selected
- Complete French translations available for all user-facing text and interface elements
- Language switching works seamlessly across all application sections and stages
- Application content displayed in Spanish by default for all new and returning users
- Spanish translation text uses "Amigo Invisible" instead of "Amigo Secreto" throughout all UI text and translation files for correct terminology and consistency
- All translation changes must preserve existing styling and component structure without breaking the interface or removing any content

## Application Stages

### Stage 1: Submission
- Users can register and create profiles containing:
  - Name
  - Wish list description (rich text field with formatting support)
- Profile creation is always available regardless of current application stage
- New users can join and create profiles at any time, even during resolution stage
- Profile editing is only available during the submission stage
- Profile editing preserves the original registrationTime field to maintain admin access order and ensure the participant with the oldest registration date remains unchanged
- All participants can see other participant names in the participants list
- Participants list displays each participant's name
- Wish list descriptions remain hidden from all users except profile owner during submission stage
- Real-time Christmas-themed countdown timer displays time remaining until submission deadline
- Countdown timer displays all numbers (days, hours, minutes, seconds) together inside a compact, reduced-size box with optimized text styling to ensure all numbers and labels fit comfortably without overflow
- Countdown numbers and text are properly sized and positioned within the compact box to ensure clean and balanced appearance with no crowding or overflow
- Default submission deadline is set to December 20 of the current year
- Participants section displays only participant names and their details without any "Participant #" numbering or labeling
- No "Submission stage" message displayed in the header of the application

### Stage 2: Resolution
- Triggered manually by the participant with the oldest registration date through the admin dashboard at any time or by this participant after deadline passes and at least 2 profiles exist
- Profile creation remains fully enabled and accessible to all users
- Profile editing is disabled during the resolution stage
- New users can still register and create profiles during resolution stage
- Each user sees only their assigned recipient's name and formatted wish list description through the Resolution tab
- Only the participant with the oldest registration date can view all Secret Santa assignments through the admin dashboard

## Rich Text Wish List Editor
- Wish list input field replaced with rich text editor supporting formatting options
- Editor supports bold, italic, underline, and bullet point formatting
- Editor allows insertion of HTTP/HTTPS links with proper link formatting
- Rich text editor styled with Christmas-themed UI to match existing application design
- Editor displays only 5 lines in height by default with vertical scroll functionality for overflow content when text exceeds 5 lines
- Scrollable editor maintains existing Christmas-themed styling and formatting options
- Editor height restriction applies consistently across all screens where the editor is used (profile setup, submission stage, resolution stage)
- Toolbar and formatting options remain unchanged
- Editor saves formatted content as HTML to backend using existing createOrUpdateProfile function
- Stored wish list content displayed as safely rendered HTML in both submission and resolution stages
- Formatted wish list content visible to profile owner during submission stage
- Formatted wish list content visible to assigned gift giver during resolution stage
- HTML content sanitized for security when displaying formatted wish lists

## Your Profile Section
- Displays the user's own profile information including name and formatted wish list description
- Edit button is only visible and enabled during the submission stage
- Edit button is hidden or disabled during the resolution stage
- Profile editing operations preserve the original registrationTime field to maintain the order of registration for admin access determination
- Wish list displayed as formatted HTML content when viewing profile

## Admin Dashboard
- Visible and accessible only to the participant with the oldest registration date (determined by comparing logged-in user's principal with the principal of the participant who has the maximum registrationTime field in backend profile data)
- Completely hidden from all other users regardless of their position in the participants list
- Admin access is determined by principal matching with the participant who has the maximum registrationTime field from backend profile data
- After login and on any profile or participant list update, the system checks if the logged-in user's principal matches the principal of the participant with the maximum registrationTime to render admin dashboard and features
- UI queries must correctly identify the participant with the oldest registration date by registrationTime and conditionally render the admin dashboard only for this user
- Admin dashboard tab menu supports horizontal scrolling and overflow on mobile devices to ensure all tabs remain accessible and the UI remains clean and usable on small screens
- Features include:
  - Deadline Status section that displays current deadline and includes functionality to modify submission deadline with functional "Update" button that saves changes to backend
  - Reset current process button to archive current round and return to submission stage - always enabled and functional for the participant with the oldest registration date with no restrictions
  - Roll back to submission stage button that transitions the system from resolution stage back to submission stage, clearing current assignments and re-enabling profile editing while preserving past rounds in archive
  - View all Secret Santa assignment pairs showing who is assigned to whom with formatted wish list content (always displayed when admin dashboard is shown)
  - Trigger Resolution button that is always visible and functional regardless of deadline status, reliably executes the Secret Santa assignment algorithm on the backend ensuring assignments are made for all participants
  - Participant management with delete functionality allowing the admin to remove other participants from the list by name, fully deleting their data and requiring them to sign up again if they wish to participate
  - Delete icons visible only next to other participants' names during the submission stage only, not during the resolution stage, and not for the admin's own entry
  - Delete operation completely removes participant data from backend storage including profiles, wish lists, and any assignments

## Resolution Tab
- Single "Resolution" tab available to all authenticated users for assignment viewing
- Shows only their own assignment (who they are assigned to give a gift to)
- Must reliably fetch and display assignment data without getting stuck on loading states
- Displays heading "Your Secret Santa is?" for the assignment section
- Displays section title "Wish List" for the recipient's formatted wish list section
- Recipient's wish list displayed as safely rendered HTML with formatting preserved

## Resolution Trigger
- Available only to the participant with the oldest registration date through the admin dashboard at any time regardless of deadline status
- Available to this participant after the submission deadline has passed
- Button is only enabled and clickable for the participant with the oldest registration date after the submission deadline has passed, disabled or hidden before the deadline for non-admin users
- Only the participant with the oldest registration date can trigger resolution at any time through the admin dashboard with the Trigger Resolution button always visible and functional
- When clicked, reliably executes the Secret Santa assignment algorithm on the backend ensuring assignments are made for all participants
- Frontend immediately refreshes and updates the UI to reflect the new app status (resolution stage and assignments) right after the resolution is triggered, without requiring a manual page reload

## Round Reset
- Available only to the participant with the oldest registration date through the admin dashboard
- Reset functionality accessible through the administrator dashboard only for the participant with the oldest registration date
- Reset button is always enabled and functional for the participant with the oldest registration date only with no restrictions
- Proper handling of round archival and stage transition back to submission
- After clicking the "Reset Round" button, the UI immediately refreshes to reflect the new app status, ensuring all relevant data and views are updated without requiring a manual reload

## Stage Rollback
- Roll back to submission stage feature available only to the participant with the oldest registration date through the admin dashboard
- Allows transitioning from resolution stage back to submission stage
- Clears current Secret Santa assignments when rolling back
- Re-enables profile editing functionality for all users
- Preserves past rounds and assignments in archive/history
- Only available when the system is currently in resolution stage
- Button is functional only for the participant with the oldest registration date

## Participant Management
- Admin participant (the one with the oldest registration date) can delete other participants from the participants list during the submission stage only
- Delete functionality is not available during the resolution stage
- Delete functionality completely removes all participant data from backend storage including profiles, wish lists, and any assignments
- Deleted participants must sign up again if they wish to participate
- Delete icons are visible only to the admin participant during the submission stage and only for other participants' entries
- Delete icons are hidden during the resolution stage
- Admin cannot delete their own entry
- Delete operation can be performed by participant name, allowing the admin to remove participants by their name identifier
- Delete operation triggers immediate UI refresh to update participants list and admin dashboard without requiring manual refresh
- Proper confirmation dialogs before deletion to prevent accidental removal
- Backend deletion logic ensures complete removal of all participant data including profiles, wish lists, assignments, and any other associated data

## Assignment System
- Optimized assignment algorithm that efficiently generates Secret Santa pairs with guaranteed completion and no infinite loops
- Algorithm uses a deterministic approach with maximum retry limits to prevent timeouts
- Handles edge cases including small participant counts and duplicate names reliably
- Returns valid assignments or clear error messages if assignment is impossible
- Fast execution time regardless of participant count or name distribution
- Robust error handling with timeout protection and fallback mechanisms
- Reliable execution when triggered through the Trigger Resolution button, ensuring assignments are made for all participants

## Privacy Controls
- During submission stage: wish list descriptions hidden from all users except profile owner
- During resolution stage: users only see their assigned recipient's complete profile with formatted wish list through the Resolution tab
- Assignment pairs are visible only to the participant with the oldest registration date through the admin dashboard

## Visual Design and Styling
- Christmas-themed color scheme and backgrounds throughout the entire application
- Festive decorative elements throughout the interface
- Christmas-themed countdown timer with holiday styling and compact, reduced-size box design with optimized text styling to ensure all countdown numbers (days, hours, minutes, seconds) and labels fit comfortably without overflow, maintaining clean and balanced appearance
- Language selector panel positioned with high z-index value to ensure it always appears on top of all other UI components and interface elements throughout the entire application
- Multi-language support with instant text updates when switching between Spanish, English, and French
- All components (header, main content, admin dashboard, participants list, profile setup, etc.) must be rendered with their intended Christmas-themed styles and structure
- Complete restoration of all visual styles and content to match the previous working version
- Ensure all UI elements are fully functional and visually consistent across all pages and components
- Header styling with proper Christmas theme and layout
- Main content area styling with festive background and decorative elements
- Admin dashboard styling with Christmas theme for the participant with the oldest registration date
- Participants list styling with proper Christmas-themed presentation
- Profile setup and editing forms with festive styling including rich text editor
- Rich text editor styled with Christmas-themed colors, borders, and decorative elements to match application design with 5-line height restriction and vertical scroll for overflow content
- Resolution tab styling with Christmas theme
- All buttons, forms, and interactive elements styled with Christmas theme
- Proper spacing, colors, fonts, and layout throughout the application
- Consistent visual hierarchy and design patterns across all sections
- All translations, especially Spanish "Amigo Invisible" terminology, must not break the UI or remove any content
- Translation updates must preserve all existing styling and component structure
- UI components must remain fully visible and functional after translation changes
- All content and features must be restored with nothing missing or broken
- Interface must be fully usable and match the previous Christmas-themed design
- All styling issues must be resolved to ensure complete visibility and functionality

## Reactive UI Updates
- After any admin action (reset round, update deadline, trigger resolution, rollback to submission stage, delete participant), the UI immediately refreshes to reflect the new app status and current admin for all users without requiring manual refresh
- All relevant components (main app, admin dashboard, submission and resolution stages) reactively display the current stage and participant/assignment data as soon as backend operations complete
- React Query hooks for stage transitions (trigger resolution, rollback to submission, and reset round) automatically invalidate and refetch all necessary queries (stage, participants, assignments, deadlines, etc.) upon mutation success
- UI remains synchronized with backend state at all times through automatic query invalidation and refetching
- Reset Round operation triggers immediate UI refresh to show updated app status and data
- Trigger Resolution operation immediately refreshes frontend and updates UI to reflect new app status (resolution stage and assignments) right after resolution is triggered, without requiring manual page reload
- All admin actions trigger immediate UI updates across all user sessions to ensure consistent state visibility
- Instant UI refresh after any admin action with proper query invalidation to ensure all users see updated state
- Admin dashboard visibility updates immediately after any admin action to reflect the correct admin user based on maximum registrationTime
- Delete participant operation triggers immediate UI refresh to update participants list and admin dashboard, removing the deleted participant from all UI components without requiring manual refresh

## Backend Connection and Error Handling
- Robust backend initialization and actor creation for every user before profile operations
- Multiple connection retry mechanisms with exponential backoff strategies
- Comprehensive backend readiness checks and connection status validation before allowing profile creation
- Transparent and automatic backend connection establishment for all users
- Error handling and recovery mechanisms that prevent users from getting stuck or returned to the sign-up page
- Clear user feedback during connection attempts with loading indicators and progress messages
- Automatic retry mechanisms with user-friendly error messages when backend connection fails
- Graceful degradation and fallback strategies to maintain application functionality during temporary backend issues
- Connection health monitoring and automatic reconnection attempts
- User notification system for backend status updates and recovery completion
- Proper logout handling that clears connection state and returns to registration page

## Backend Data Storage
- User profiles (name, formatted wish list description as HTML, registrationTime field)
- registrationTime field is immutable once set during initial profile creation and stored in backend profile data
- Current application stage and deadline settings
- Secret Santa assignments for current and past rounds
- Admin configuration settings
- Connection status and health monitoring data
- User session and authentication state
- Archive of past rounds and their assignments
- Participants list with registrationTime field stored in backend profile data to determine admin privileges
- Principal-to-registrationTime mapping for admin access determination
- HTML formatted wish list content with proper sanitization for security

## Backend Operations
- User registration and profile management with connection validation and registrationTime field recording in backend profile data, always enabled regardless of application stage
- registrationTime field is set only during initial profile creation and remains unchanged during profile edits to preserve admin access order and ensure the participant with the oldest registration date remains unchanged
- Profile creation operations that are never blocked by current stage, allowing new users to join at any time
- Profile editing operations for formatted wish list description that are only available during the submission stage and preserve the original registrationTime field stored in backend profile data
- HTML content storage and retrieval for formatted wish lists with proper sanitization
- Participant deletion operations available only to the admin participant during the submission stage, supporting deletion by participant name, completely removing all participant data from backend storage including profiles, wish lists, assignments, and any other associated data, requiring deleted users to sign up again
- Stage transition management with optimized assignment algorithm implementation accessible only to the participant with the oldest registration date at any time without deadline restrictions
- Stage rollback operations that transition from resolution stage back to submission stage, clearing current assignments and re-enabling profile editing while preserving past rounds in archive - available only to the participant with the oldest registration date
- Optimized assignment generation using efficient shuffle-based algorithm with guaranteed completion, maximum retry limits, timeout protection, and self-assignment prevention that handles edge cases including small participant counts and duplicate names
- Assignment storage and retrieval with role-based access control (individual assignments for regular users through Resolution tab, all assignments accessible only to the participant with the oldest registration date through admin dashboard)
- Assignment clearing operations for stage rollback functionality
- Deadline and timer management with reliable deadline update functionality accessible only to the participant with the oldest registration date through the Deadline Status section in the admin dashboard
- Backend health checks and connection monitoring
- Error logging and recovery operations
- Connection retry and fallback handling
- User session management and logout processing
- Deadline modification operations that persist changes and update UI state, available only to the participant with the oldest registration date through the Deadline Status section
- Default deadline initialization to December 20 of the current year
- Resolution trigger operations available only to the participant with the oldest registration date at any time without restrictions, reliably executing the Secret Santa assignment algorithm ensuring assignments are made for all participants
- Assignment retrieval operations that return appropriate assignment data with proper error handling and timeout management to prevent loading state issues
- Assignment pairs retrieval for admin dashboard display accessible only to the participant with the oldest registration date
- Round reset operations available only to the participant with the oldest registration date through the admin dashboard for archiving current round and returning to submission stage
- Round archival operations that preserve past rounds and assignments in history
- Participant list retrieval operations that display only participant names and details without any numbering or "Participant #" labeling
- Admin privilege checking based on principal matching with the participant who has the maximum registrationTime field in backend profile data
- registrationTime comparison operations using backend profile data to identify the participant with the oldest registration date with the maximum registrationTime field
- Profile update operations that modify user data while preserving the original registrationTime field stored in backend profile data to maintain admin access order and ensure the participant with the oldest registration date remains unchanged even after profile edits
- Principal lookup operations to determine which user principal corresponds to the maximum registrationTime field for admin access control
- Global UI state synchronization operations that broadcast admin action results to all connected users for immediate UI updates
- Backend operations to correctly identify the participant with the oldest registration date by maximum registrationTime for proper admin access control
- Comprehensive participant deletion backend operations that support deletion by participant name and completely remove all user data including profiles, wish lists, assignments, and any other associated participant data from all backend storage systems and data structures
- HTML content validation and sanitization operations for secure storage and display of formatted wish lists
