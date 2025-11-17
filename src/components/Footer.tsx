import logo from "@/assets/logo-dark.png";

const Footer = () => {
  const footerColumns = [
    {
      heading: "Contact",
      items: [
        "Rank Pharmacy, 8 Carlton Parade",
        "Orpington, Kent, BR6 0JB",
        "enquiry@priorypharmacy.uk",
        "01689 823826",
      ],
    },
    {
      heading: "Opening Hours",
      items: [
        "Mon – Fri: 9am – 6pm",
        "Saturday: 9am – 5:30pm",
        "Sunday: Closed",
      ],
    },
    {
      heading: "Services",
      links: [
        { label: "Prescriptions", href: "/#prescriptions" },
        { label: "All Services", href: "/#services" },
        { label: "Nominate", href: "/#nominate" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "/#about" },
        { label: "Privacy", href: "/#privacy" },
      ],
    },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-padding mx-auto max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-1">
            <img src={logo} alt="Rank Pharmacy" className="h-10 mb-4" />
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-bold text-lg mb-4">{column.heading}</h3>
              {column.items && (
                <ul className="space-y-2">
                  {column.items.map((item) => (
                    <li key={item} className="text-secondary text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {column.links && (
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-secondary hover:text-accent smooth-transition text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary">
          <p>© 2025 Rank Pharmacy. All rights reserved.</p>
          <p>Powered by PharmAppy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
