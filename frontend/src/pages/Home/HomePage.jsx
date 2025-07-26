import Hero from "../../components/Hero"
import Footer from "../../components/Footer"
import HowItWorks from "../../components/HowItWorks"
import Testimonials from "../../components/Testimonials"
import Features from "../../components/Features"

function HomePage({openSignUp}) {
  return (
    <div>
        <Hero openSignUp={openSignUp}/>
        <Features />
        <HowItWorks />
        <Testimonials />
        <Footer />
    </div>
  );
}

export default HomePage;