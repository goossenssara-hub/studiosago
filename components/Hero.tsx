import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <h1>
          Leren. Ontdekken. <br></br><span className="red">G</span><span className="orange">r</span><span className="yellow">o</span><span className="green">e</span><span className="teal">i</span><span className="navy">e</span><span className="purple">n</span>.
        </h1>
        <p className="lead">Samen op avontuur in leren, groeien en beleven!</p>
      </div>

      <div className="hero-art" aria-hidden="true">


        <Image className="hero-illustration" src="/assets/landscape.png" alt="" width={720} height={530} priority />
      </div>
    </section>
  );
}
