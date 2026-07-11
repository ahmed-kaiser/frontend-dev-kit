import "./ComingSoon.css";

interface Props {
  label: string;
}

export default function ComingSoon({ label }: Props) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-ico">✦</div>
      <h2>{label}</h2>
      <p>This tool isn't built yet — it's next up on the roadmap.</p>
    </div>
  );
}
