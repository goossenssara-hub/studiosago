type AdminPlaceholderProps = {
  title: string;
  text: string;
};

export default function AdminPlaceholder({ title, text }: AdminPlaceholderProps) {
  return (
    <div className="table-card">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}