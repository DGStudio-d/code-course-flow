import React from "react";
import { useTranslation } from "react-i18next";

const PaymentInfo = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t("payment.title")}
      </h2>
      <p className="text-gray-600 text-center mb-8">{t("payment.via")}</p>

      <div className="space-y-8">
        <div className="border-b pb-6">
          <h3 className="text-xl font-bold mb-4 text-center">
            {t("payment.bank1")}
          </h3>
          <div className="space-y-2">
            <p className="text-gray-700">RIB : 350810000000007352205 97</p>
            <p className="text-gray-700">
              IBAN : MA64 350 810{" "}
              <span className="text-green-600 font-medium">
                000000000735220
              </span>
              5 97
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 text-center">
            {t("payment.bank2")}
          </h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              {t("payment.holder")} : ZAKARIA AFIF
            </p>
            <p className="text-gray-700">
              RIB : 230 610{" "}
              <span className="text-green-600 font-medium">
                3678445211001600
              </span>{" "}
              13
            </p>
            <p className="text-gray-700">
              IBAN : MA64{" "}
              <span className="text-green-600 font-medium">
                2306 1036 7844 5211 0016 0013
              </span>
            </p>
            <p className="text-gray-700">Code SWIFT : CIHMMAM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
