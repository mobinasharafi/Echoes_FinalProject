import { useParams } from "react-router-dom";

export default function CaseDetail() {
  const { id } = useParams();

  return (
    <div>
      <h2>Case Detail</h2>
      <p>Case ID: {id}</p>
      <p>Case overview + leads + support + private inbox entry.</p>
    </div>
  );
}