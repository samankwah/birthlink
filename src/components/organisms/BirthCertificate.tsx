import { forwardRef } from "react";
import type { BirthRegistration } from "../../types";
import { formatParentNationality } from "../../utils/certificateNumber";
import ghanaCoatOfArms from "../../assets/Coat_of_arms_of_Ghana.svg.webp";

interface BirthCertificateProps {
  registration: BirthRegistration;
  serialNumber?: string;
}

export const BirthCertificate = forwardRef<
  HTMLDivElement,
  BirthCertificateProps
>(({ registration, serialNumber }, ref) => {
  const getDayOfYear = (date: Date | string | { toDate?: () => Date }) => {
    let dateObj: Date;
    if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (
      date &&
      typeof date === "object" &&
      "toDate" in date &&
      typeof date.toDate === "function"
    ) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date();
    }
    return dateObj.getDate();
  };

  const getMonthName = (date: Date | string | { toDate?: () => Date }) => {
    let dateObj: Date;
    if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (
      date &&
      typeof date === "object" &&
      "toDate" in date &&
      typeof date.toDate === "function"
    ) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date();
    }
    return dateObj.toLocaleDateString("en-GB", { month: "long" });
  };

  const getYear = (date: Date | string | { toDate?: () => Date }) => {
    let dateObj: Date;
    if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (
      date &&
      typeof date === "object" &&
      "toDate" in date &&
      typeof date.toDate === "function"
    ) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date();
    }
    return dateObj.getFullYear();
  };

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .birth-certificate {
              width: 190mm !important;
              min-height: auto !important;
              max-height: 277mm !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 8mm !important;
              font-family: 'Times New Roman', Times, serif !important;
              font-size: 9pt !important;
              line-height: 1.1 !important;
              background: white !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
              overflow: hidden !important;
            }
            .certificate-border {
              border: 2px solid black !important;
              padding: 8mm !important;
              margin-bottom: 2mm !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
              height: auto !important;
              max-height: 260mm !important;
              overflow: hidden !important;
            }
            .certificate-footer {
              font-size: 8pt !important;
              margin-top: 2mm !important;
              display: flex !important;
              justify-content: space-between !important;
            }
            /* Override all inline font sizes for form fields */
            .border-b {
              font-size: 10pt !important;
            }
            span {
              font-size: 10pt !important;
            }
            /* Specific overrides for date and form fields */
            .flex.items-baseline span {
              font-size: 10pt !important;
            }
            /* Reduce spacing between form fields */
            .flex.items-baseline {
              margin: 6px 0 !important;
            }
            /* Header elements */
            .text-center.mb-6 {
              font-size: 12pt !important;
              margin-bottom: 1rem !important;
            }
            /* Footer section spacing */
            .flex.justify-between.items-end {
              margin-top: 8mm !important;
            }
          }
        `}</style>
      <div
        ref={ref}
        className="birth-certificate bg-white relative w-full max-w-4xl mx-auto print:w-full print:max-w-none"
        style={{
          fontFamily: "Times New Roman, Times, serif",
          fontSize: "12pt",
          lineHeight: "1.4",
          padding: "10mm",
          boxSizing: "border-box",
          minHeight: "auto",
          maxHeight: "270mm",
          pageBreakInside: "avoid",
        }}
      >
        {/* Main Certificate with Border */}
        <div
          className="certificate-border"
          style={{
            border: "3px solid black",
            borderRadius: "0",
            padding: "15mm",
            marginBottom: "8mm",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
              fontSize: "9pt",
              fontWeight: "bold",
              letterSpacing: "2px",
              fontFamily: "Times New Roman, Times, serif",
            }}
          >
            STRICTLY FOR CHILDREN 0 — 12 MONTHS
          </div>

          {/* Certificate Number - Top Right */}
          <div
            style={{
              position: "absolute",
              top: "15mm",
              right: "20mm",
              fontSize: "14pt",
              fontWeight: "bold",
              fontFamily: "Times New Roman, Times, serif",
            }}
          >
            N°{" "}
            {registration.registrarInfo?.certificateNumber ||
              serialNumber ||
              registration.registrationNumber?.split("-")[2] ||
              "0000000"}
          </div>

          {/* Ghana Coat of Arms */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <img
                src={ghanaCoatOfArms}
                alt="Ghana Coat of Arms"
                style={{ width: "60px", height: "60px" }}
              />
            </div>

            {/* Titles */}
            <div
              style={{ fontSize: "13pt", fontWeight: "bold", margin: "8px 0" }}
            >
              REPUBLIC OF GHANA
            </div>

            <div
              style={{
                fontSize: "18pt",
                fontWeight: "bold",
                letterSpacing: "3px",
                margin: "8px 0",
              }}
            >
              BIRTH CERTIFICATE
            </div>

            <div style={{ fontSize: "9pt", margin: "5px 0" }}>
              (Section 11 Act 301)
            </div>
          </div>

          {/* Main Statement */}
          <div
            className="text-center mb-6"
            style={{ fontSize: "14pt", fontWeight: "bold" }}
          >
            This is to Certify that the Birth
          </div>

          {/* Form Fields with dotted lines - optimized spacing */}
          <div className="space-y-4">
            {/* Child Name */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                of
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                }}
              >
                {registration.childDetails.firstName}{" "}
                {registration.childDetails.lastName}
              </span>
            </div>

            {/* Place of Birth */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                born at
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                }}
              >
                {registration.childDetails.placeOfBirth}
              </span>
            </div>

            {/* Date of Birth */}
            <div className="flex items-baseline" style={{ margin: "10px 0" }}>
              <span>on the</span>
              <span
                className="border-b border-dotted border-black mx-2 text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  width: "90px",
                  display: "inline-block",
                  fontSize: "12pt",
                }}
              >
                {getDayOfYear(registration.childDetails.dateOfBirth)}
              </span>
              <span>day of</span>
              <span
                className="border-b border-dotted border-black mx-2 text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  width: "200px",
                  display: "inline-block",
                  fontSize: "12pt",
                }}
              >
                {getMonthName(registration.childDetails.dateOfBirth)}
              </span>
              <span>20</span>
              <span
                className="border-b border-dotted border-black mx-2 text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  width: "140px",
                  display: "inline-block",
                  fontSize: "12pt",
                }}
              >
                {getYear(registration.childDetails.dateOfBirth)
                  .toString()
                  .slice(-2)}
              </span>
            </div>

            {/* Registration Region and District */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                has been duly registered in the register of Births for
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  width: "200px",
                  display: "inline-block",
                }}
              >
                {registration.registrarInfo?.region}
              </span>
              <span style={{ minWidth: "fit-content", marginLeft: "8px" }}>
                , in the
              </span>
            </div>

            {/* District Registration Line */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                  marginRight: "8px",
                }}
              >
                {registration.registrarInfo?.district}
              </span>
              <span style={{ minWidth: "fit-content" }}>
                Registration District.
              </span>
            </div>

            {/* Child Name Again */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                The said
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                }}
              >
                {registration.childDetails.firstName}{" "}
                {registration.childDetails.lastName}
              </span>
            </div>

            {/* Mother Details */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                is the {registration.childDetails.gender.toLowerCase()} child of
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                }}
              >
                {registration.motherDetails.firstName}{" "}
                {registration.motherDetails.lastName}
              </span>
            </div>

            {/* Empty Line */}
            <div className="flex items-baseline" style={{ margin: "10px 0" }}>
              <span
                className="border-b border-dotted border-black w-full text-center"
                style={{ minHeight: "22px", paddingBottom: "3px" }}
              ></span>
            </div>

            {/* Mother Nationality */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                a National of
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                }}
              >
                {formatParentNationality(
                  registration.motherDetails.nationality || "Ghana"
                ).replace("National of ", "")}
              </span>
            </div>

            {/* Father Details */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                and
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                }}
              >
                {registration.fatherDetails.firstName}{" "}
                {registration.fatherDetails.lastName}
              </span>
            </div>

            {/* Father Nationality */}
            <div
              className="flex items-baseline"
              style={{ margin: "10px 0", width: "100%" }}
            >
              <span style={{ minWidth: "fit-content", marginRight: "8px" }}>
                a National of
              </span>
              <span
                className="border-b border-dotted border-black text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  fontSize: "12pt",
                  flex: "1",
                  display: "block",
                }}
              >
                {formatParentNationality(
                  registration.fatherDetails.nationality || "Ghana"
                ).replace("National of ", "")}
              </span>
            </div>

            {/* Witness Line */}
            <div className="flex items-baseline" style={{ margin: "10px 0" }}>
              <span>witness my hand this</span>
              <span
                className="border-b border-dotted border-black mx-2 text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  width: "90px",
                  display: "inline-block",
                  fontSize: "12pt",
                }}
              >
                {getDayOfYear(
                  registration.registrarInfo?.registrationDate || new Date()
                )}
              </span>
              <span>day of</span>
              <span
                className="border-b border-dotted border-black mx-2 text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  width: "140px",
                  display: "inline-block",
                  fontSize: "12pt",
                }}
              >
                {getMonthName(
                  registration.registrarInfo?.registrationDate || new Date()
                )}
              </span>
              <span>20</span>
              <span
                className="border-b border-dotted border-black mx-2 text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  width: "10let 0px",
                  display: "inline-block",
                  fontSize: "12pt",
                }}
              >
                {getYear(
                  registration.registrarInfo?.registrationDate || new Date()
                )
                  .toString()
                  .slice(-2)}
              </span>
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex justify-between items-end mt-16">
            <div className="flex items-baseline">
              <span>Entry No.</span>
              <span
                className="border-b border-dotted border-black mx-2 text-center font-bold"
                style={{
                  minHeight: "22px",
                  paddingBottom: "3px",
                  width: "150px",
                  display: "inline-block",
                  fontSize: "12pt",
                }}
              >
                {registration.registrarInfo?.entryNumber ||
                  registration.registrationNumber}
              </span>
            </div>

            <div className="text-center">
              <div
                className="border-b-2 border-black mb-2"
                style={{ width: "200px", height: "35px" }}
              ></div>
              <div style={{ fontStyle: "italic", fontSize: "11pt" }}>
                Registrar
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info - Outside Border */}
        <div
          className="certificate-footer"
          style={{
            fontSize: "9pt",
            marginTop: "5mm",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>BHP Counterfoil</div>
          <div>Birth Certificate Form R</div>
        </div>
      </div>
    </>
  );
});

BirthCertificate.displayName = "BirthCertificate";
