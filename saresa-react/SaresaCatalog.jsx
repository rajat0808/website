const catalogItems = [
  ["Pink Chikankari Kurta Set", "assets/saresa-slide-01.png"],
  ["Mauve Chikankari Kurta Set", "assets/saresa-slide-02.png"],
  ["Pastel Yellow Kurta Set", "assets/saresa-slide-03.png"],
  ["Mint Green Chikankari Kurta", "assets/saresa-slide-04.png"],
  ["Blue Chikankari Kurta Set", "assets/saresa-slide-05.png"],
  ["Floral Chikankari Kurta Set", "assets/saresa-slide-06.png"],
  ["Garden Yellow Kurta Set", "assets/saresa-slide-07.png"],
  ["Bright Yellow Chikankari Kurta", "assets/saresa-slide-08.png"],
  ["Pink Embroidered Kurta Set", "assets/saresa-slide-09.png"],
  ["Black Lace Kurta Set", "assets/saresa-new-01.png"],
  ["Yellow Embroidered Kurta Set", "assets/saresa-new-02.png"],
  ["Blue Printed Kurta Set", "assets/saresa-new-03.png"],
  ["Turquoise Chikankari Kurta Set", "assets/saresa-new-04.png"],
  ["Blue Floral Kurta Set", "assets/saresa-new-05.png"],
  ["Purple Embroidered Kurta Set", "assets/saresa-new-06.png"],
  ["Powder Blue Chikankari Kurta", "assets/saresa-new-07.png"],
  ["Pistachio Green Kurta Set", "assets/saresa-new-08.png"],
  ["Beige Chikankari Kurta Set", "assets/saresa-new-09.png"],
  ["Nude Embroidered Kurta Set", "assets/saresa-new-10.png"],
  ["Yellow Printed Co-ord Set", "assets/saresa-new-11.png"],
];

export default function SaresaCatalog() {
  return <>
    <main className="catalog-main">
      <p className="catalog-kicker">SARESA · CHIKANKARI REIMAGINED</p>
      <h1>Saresa Collection</h1>
      <p className="catalog-intro">Explore our latest Lucknow-inspired Chikankari pieces. Ask our stylist for price and availability.</p>
      <div className="catalog-grid">
        {catalogItems.map(([name, image], index) => <article className="catalog-card" key={image}>
          <img src={image} alt={name} loading={index < 4 ? "eager" : "lazy"} />
          <div className="catalog-card__body">
            <h2>{name}</h2>
          <a href={`https://wa.me/918130852777?text=${encodeURIComponent(`Namaste! I would like to know the price and availability of this Saresa product: ${name}.`)}`} target="_blank" rel="noopener noreferrer">REQUEST FOR PRICE</a>
          </div>
        </article>)}
      </div>
    </main>
    <a className="se-catalog-whatsapp" href="https://wa.me/918130852777?text=Namaste!%20I%20would%20like%20to%20know%20the%20price%20and%20availability%20of%20a%20Saresa%20product." target="_blank" rel="noopener noreferrer" aria-label="Ask about Saresa products on WhatsApp">
      <i className="fab fa-whatsapp" aria-hidden="true" />
    </a>
  </>;
}
