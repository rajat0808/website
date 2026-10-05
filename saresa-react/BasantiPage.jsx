import { Header, Footer, ContactWidgets, HeroSlider } from "./SaresaPage.jsx";

const slides = ["Ivory embellished corset and trousers", "Ivory embellished sari", "Multicolour draped Basanti ensemble", "Basanti pink ensemble", "Basanti green ensemble"];
const images = ["assets/basanti-slide-01.webp", "assets/basanti-slide-02.webp", "assets/basanti-slide-03.webp", "assets/basanti-hero-pink.jpeg", "assets/basanti-hero-green.jpeg"];

export default function BasantiPage() {

  return (<>
    <Header />
    <main className="brand-main">
      <HeroSlider slides={slides} imageSources={images} label="Basanti collection" sliderClassName="basanti-slider" viewHref="basanti-catalog.html" viewLabel="+ View More" />
      <section className="saresa-story basanti-story" id="brand-details" aria-labelledby="basanti-title">
        <div className="saresa-story__profile">
          <div className="basanti-brand-heading">
            <img className="saresa-story__logo" src="assets/logo-basanti-lockup.webp" alt="Basanti — kapde aur koffie" width="400" height="130" loading="lazy" />
          </div>
          <div className="saresa-story__contacts">
            <a href="mailto:lucknowstore@basantikekapde.com" className="saresa-story__contact"><span className="saresa-story__icon" aria-hidden="true">✉</span><span>lucknowstore@basantikekapde.com</span></a>
            <div className="saresa-story__contact"><span className="saresa-story__icon" aria-hidden="true">◷</span><span>Mon–Sun 11:00 AM – 9:00 PM</span></div>
            <a href="https://wa.me/919220199588" target="_blank" rel="noopener noreferrer" className="saresa-story__contact" aria-label="Chat with Basanti on WhatsApp at +91 92201 99588"><span className="saresa-story__icon" aria-hidden="true"><i className="fab fa-whatsapp"></i></span><span>+91 92201 99588</span></a>
          </div>
        </div>
          <article className="saresa-story__about">

              <h2 id="basanti-title">About Basanti</h2>
              <div className="saresa-story__category">KAPDE AUR KOFFEE</div>
              <p>Founded in 2017 by Utkarsh Ahuja, Basanti stands at the forefront of fashion with contemporary styles that fuse fast fashion with timeless elegance. The brand is dedicated to refreshing wardrobes with designs that blend modern simplicity, romantic flair, and affordability.</p>
              <p>Basanti's story is rooted in a powerful family legacy. In 1947, Utkarsh's grandfather came to India with nothing. Over the next four decades, he did everything he could to build shelter, stability, and an abundance of love for his family. In 1988, he and Utkarsh's father began trading women's textiles in Chandni Chowk, and over the next two decades Utkarsh's parents helped pioneer and champion the women's textile white-label market.</p>
              <p>In 2010, Utkarsh joined the family business with ambitions of his own, and in 2017 Basanti was born. The name came from his grandfather, with one simple brief: it had to be unforgettable. Utkarsh added "kapde aur koffee" to reflect his vision of revolutionising the buying experience.</p>
              <p>The journey has continued to evolve ever since. Basanti went online in 2018, introduced its Warehouse Experience Centre in 2019, opened its first store outside NCR in 2023, and in 2024 unveiled Khan Market - a landmark of love, resilience, and passion dedicated to Utkarsh's grandfather. #WeLoveYou</p>
              <p>Basanti transcends traditional fashion boundaries. Its flagship store enhances this approach with a charming coffee bar, inviting guests to unwind with a cup of coffee and the soothing rhythms of folk India in a serene shopping environment.</p>
              <p>In 2024, the brand took a bold step further by launching an exclusive line of accessories. The collection includes handcrafted jewellery and designer potlis and bags, each piece thoughtfully created to complement Basanti's clothing lines and complete every look.</p>
              <p>Every visit to Basanti offers more than just shopping. From the ambient music to the curated product range, every detail is designed to enrich your lifestyle. Whether you are browsing the latest collections, enjoying a quiet coffee, or exploring the accessories line, Basanti ensures that every piece you take home is a testament to quality, style, and joy. Here, fashion is not just seen - it is experienced.</p>
          </article>

        <div className="brand-profile-actions">
          <a className="brand-back-link" href="/brand">Back to brands</a>
        </div>
      </section>
    </main>
    <Footer /><ContactWidgets />

  </>);
}

