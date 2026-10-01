const products = [
  ["Ivory Embellished Corset Set", "assets/basanti-slide-01.webp"],
  ["Ivory Embellished Saree", "assets/basanti-slide-02.webp"],
  ["Multicolour Draped Saree Set", "assets/basanti-slide-03.webp"],
  ["Pink Basanti Ensemble", "assets/basanti-hero-pink.jpeg"],
  ["Green Basanti Ensemble", "assets/basanti-hero-green.jpeg"],
  ["Yellow Basanti Ensemble", "assets/basanti-hero-yellow.jpeg"],
  ["Sage Green Embroidered Kurta Set", "assets/basanti-catalog-01.webp"],
  ["Mustard Embellished Corset and Skirt", "assets/basanti-catalog-02.webp"],
  ["Sage Green Embellished Saree", "assets/basanti-catalog-03.webp"],
  ["Multicolour Draped Saree", "assets/basanti-catalog-04.webp"],
  ["Blush Pink Embellished Set", "assets/basanti-catalog-05.webp"],
];

export default function BasantiCatalog() {
  return <main className="catalog-main basanti-catalog-main">
    <p className="catalog-kicker">BASANTI · KAPDE AUR KOFFEE</p>
    <h1>Basanti Collection</h1>
    <p className="catalog-intro">Explore Basanti’s occasion and contemporary wear. Ask our team for pricing and availability.</p>
    <div className="catalog-grid">
      {products.map(([name, image], index) => <article className="catalog-card" key={image}>
        <img src={image} alt={name} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
        <div className="catalog-card__body">
          <h2>{name}</h2>
          <a href={`https://wa.me/919220199588?text=${encodeURIComponent(`Namaste! I would like to know the price and availability of this Basanti product: ${name}.`)}`} target="_blank" rel="noopener noreferrer">REQUEST FOR PRICE</a>
        </div>
      </article>)}
    </div>
    <a className="se-catalog-whatsapp" href="https://wa.me/919220199588?text=Namaste!%20I%20would%20like%20to%20know%20the%20price%20and%20availability%20of%20a%20Basanti%20product." target="_blank" rel="noopener noreferrer" aria-label="Ask about Basanti products on WhatsApp">
      <i className="fab fa-whatsapp" aria-hidden="true" />
    </a>
  </main>;
}
