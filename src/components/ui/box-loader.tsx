// Box Loader from 21st.dev (supplied by the owner: "сделай такую анимацию загрузки"), recoloured for BraceMotion.
import "./box-loader.css";

const faces = ["front", "right", "top", "back"] as const;

export default function BoxLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="bm-box-loader" role="status" aria-label={label}>
      <div className="boxes" aria-hidden="true">
        {[1, 2, 3, 4].map((box) => (
          <div key={box} className={`box box-${box}`}>
            {faces.map((face) => (
              <div key={face} className={`face face-${face}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
