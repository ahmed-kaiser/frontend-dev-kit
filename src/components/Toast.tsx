interface Props { message: string; show: boolean; }
export default function Toast({ message, show }: Props) {
  return <div className={"toast" + (show ? " show" : "")}>{message}</div>;
}
