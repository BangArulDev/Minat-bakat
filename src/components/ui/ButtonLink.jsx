import Link from "next/link";

const ButtonLink = ({ children, href = "#", variant = "primary" }) => {
    
    const base = 'group px-8 py-4 rounded-full font-medium transition-all flex items-center gap-2'

    const variants = {
        primary: 'bg-gray-900 text-white hover:bg-gray-800',
        outline: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
    }

  return (
    <Link
      href={href}
      className={`${base} ${variants [variant]}`}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;