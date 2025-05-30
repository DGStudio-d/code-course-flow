import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import PaymentInfo from "@/components/PaymentInfo";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-12">
            {t("contact.title")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <ContactForm />
            </div>
            <div>
              <PaymentInfo />

              {/* Additional Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <p>
                    <strong>Email:</strong> info@learnacademy.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +1 (555) 123-4567
                  </p>
                  <p>
                    <strong>Address:</strong> 123 Education Street, Language
                    City
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
