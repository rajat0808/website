export default function EventsPage({ content }) {
  return <div className="events-react-content" dangerouslySetInnerHTML={{ __html: content }} />;
}
