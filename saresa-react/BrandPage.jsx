export default function BrandPage({ content }) {
  return <div className="brand-react-content" dangerouslySetInnerHTML={{ __html: content }} />;
}
