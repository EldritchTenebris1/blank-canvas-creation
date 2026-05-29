I will enhance the Dashboard to provide more value and better visual polish.

### Improvements
- **Enhanced Metrics**: Update the stats cards with trend indicators and better visual hierarchy.
- **Low Stock Alerts**: A dedicated section to quickly identify products needing replenishment.
- **Recent Activity**: A list of the latest inventory movements (sales, entries, exits) with descriptive icons.
- **Bento Grid Refinement**: Optimizing the layout for better data density and readability.
- **Quick Actions**: Adding shortcuts for the most frequent tasks like registering a sale or adding stock.

### Technical Details
- Update `src/components/buriti/Stat.tsx` to include trend indicators.
- Create `src/components/buriti/RecentMovements.tsx` to display movement history.
- Update `src/routes/_authenticated/dashboard.tsx` to integrate these new components and refine the layout.
- Improve data processing in the Dashboard to provide more insights from existing Supabase queries.
