import dynamic from 'next/dynamic';
const ProductTable = dynamic(() => import('./table'), { ssr: false });

export default function Products() {
    return (
        <div className="w-full flex flex-col p-5">
            <ProductTable />
        </div>
    );
}