export default function CalendarLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-8 w-28 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded mt-2" />
      </div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  );
}
