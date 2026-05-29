export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-[clamp(1.5rem,5vw,2.25rem)] font-black tracking-tighter leading-tight text-slate-800 dark:text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-[clamp(0.875rem,2vw,1rem)] text-muted-foreground/80 font-medium">
            {description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {action}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="glass grid place-items-center rounded-2xl p-12 text-center">
      <div className="text-base font-semibold">{title}</div>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}