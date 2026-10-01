export default function IndexPage({ content }) {
  return <div className="index-react-content" dangerouslySetInnerHTML={{ __html: content }} />;
}
