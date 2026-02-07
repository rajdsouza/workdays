# workdays

Task: Build a lightweight Android-compatible web app (using React or Flutter) that integrates with Google Calendar API to track office attendance.

Core Logic:

Calendar Integration: The app must sync with the user's Google Calendar and filter for a specific keyword (default: "Office") or a specific Calendar Layer.

Working Day Calculation: Define "Working Days" as Monday through Friday. Allow the user to toggle off standard Public Holidays.

The 50% Goal: > * Calculate:  
Total Available Working Days
Actual Office Days
​	
 ×100

Calculate this ratio for both the current Calendar Week and the current Calendar Month.

UI Requirements:

Dashboard: A circular progress ring showing the current month's percentage.

Status Indicator: If the percentage is <50%, show a "Needs Attention" status with the number of days remaining to hit the goal. If ≥50%, show a "Goal Met" status.

Visual Log: A simple list view of the current month showing which days were logged as "In Office."

Tech Stack: Use a mobile-responsive frontend. Ensure it uses OAuth2 for secure Google Calendar access.

Key Technical Details for the AI

To ensure the AI doesn't give you a broken prototype, make sure it handles these two specific "gotchas":

The "Double Entry" Bug: Tell the AI to count unique days, not total events. (If you have two "Office" meetings in one day, it should still only count as one day in the office).

Timezone Awareness: Ensure the app pulls the calendar based on the user's local device time to avoid "Office" days showing up on the wrong date.

Recommended Features to Add

If you want the app to be even more useful, ask the AI to include:

A "Quick Add" Button: A one-tap button in the app that automatically creates an "Office" event on the user's calendar for "Today."

Push Notifications: A reminder at 4:00 PM on Thursdays if the user is currently below their 50% goal for the week.