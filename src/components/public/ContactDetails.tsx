type Labels = { email: string; phoneContact: string; address: string; whatsapp: string; facebook: string; youtube: string };

export function ContactDetails({ labels }: { labels: Labels }) {
  return <section className="public-contact-details" aria-label={labels.address}>
    <div><h2>{labels.email}</h2><a href="mailto:onskillitbd@gmail.com">onskillitbd@gmail.com</a></div>
    <div><h2>{labels.phoneContact}</h2><a href="tel:+8801617301184">+8801617301184</a><a href="https://wa.me/8801617301184" rel="noopener noreferrer">{labels.whatsapp}</a></div>
    <div><h2>{labels.address}</h2><address lang="en">40/1 Kalicharan Shaha Road, Gandaria, Dhaka-1204, Bangladesh</address></div>
    <div><h2>{labels.facebook}</h2><a href="https://www.facebook.com/onskillit" rel="noopener noreferrer">{labels.facebook}</a></div>
    <div><h2>{labels.youtube}</h2><a href="https://www.youtube.com/@onskillit" rel="noopener noreferrer">{labels.youtube}</a></div>
  </section>;
}
