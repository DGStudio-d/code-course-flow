
import Header from '@/components/Header';
import ContactForm from '@/components/ContactForm';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;
