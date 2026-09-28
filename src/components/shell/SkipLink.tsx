export function SkipLink({ label }: { label: string }) {
  return (
    <a className="skip-link" href="#content">
      {label}
    </a>
  );
}
