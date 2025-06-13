import { useProducts } from "@/contexts/products";
import {
    Avatar,
    Button,
    Chip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
    Input,
    Pagination,
    Selection,
    SortDescriptor,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from "@heroui/react";
import React, { SVGProps, useState } from "react";

import NewProductForm from "@/components/forms/products/new";
import { Modal, ModalContent } from "@heroui/react";
import { FaTags } from "react-icons/fa6";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export const PlusIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={size || height}
            role="presentation"
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            >
                <path d="M6 12h12" />
                <path d="M12 18V6" />
            </g>
        </svg>
    );
};

export const VerticalDotsIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={size || height}
            role="presentation"
            viewBox="0 0 24 24"
            width={size || width}
            {...props}
        >
            <path
                d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                fill="currentColor"
            />
        </svg>
    );
};

export const SearchIcon = (props: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...props}
        >
            <path
                d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
            <path
                d="M22 22L20 20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
            />
        </svg>
    );
};

export const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }: IconSvgProps) => {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="1em"
            role="presentation"
            viewBox="0 0 24 24"
            width="1em"
            {...otherProps}
        >
            <path
                d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit={10}
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

const columns = [
    { name: "PRODUTO", uid: "name", sortable: true },
    { name: "DESCRIÇÃO", uid: "description", sortable: true },
    { name: "PREÇO", uid: "price", sortable: true },
    { name: "ESTOQUE", uid: "stock", sortable: true },
    { name: "OPÇÕES", uid: "actions" },
];

import Product from "@/types/products";

export default function ProductTable() {
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
    const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
        new Set(["name", "description", "price", "stock", "actions"])
    );
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });
    const [page, setPage] = React.useState(1);
    const [error, setError] = useState<string | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { products, setSelectedProduct } = useProducts();

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;
        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredProducts = [...products];
        if (hasSearchFilter) {
            filteredProducts = filteredProducts.filter((product) =>
                product.name.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        return filteredProducts;
    }, [products, filterValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a: Product, b: Product) => {
            let first, second;
            if (sortDescriptor.column === "price") {
                first = a.store_products?.[0]?.price || 0;
                second = b.store_products?.[0]?.price || 0;
            } else if (sortDescriptor.column === "stock") {
                first = (a.store_products || []).reduce((sum, sp) => sum + (sp.stock || 0), 0);
                second = (b.store_products || []).reduce((sum, sp) => sum + (sp.stock || 0), 0);
            } else {
                first = a[sortDescriptor.column as keyof Product] as string;
                second = b[sortDescriptor.column as keyof Product] as string;
            }
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const renderCell = React.useCallback((product: Product, columnKey: React.Key) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-row gap-2 items-center w-full">
                        {product.image ? (
                            <Image
                                className='bg-default-100 max-w-[120px] max-h-[120px]'
                                width={60}
                                radius='sm'
                                src={`${product?.image}`}
                            />
                        ) : (
                            <Avatar
                                radius="sm"
                                classNames={{
                                    base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                                    icon: "text-black/80",
                                }}
                                icon={<FaTags className="text-default-200" />}
                            />
                        )}
                        <p className={`text-bold text-small line-clamp-2 overflow-hidden text-ellipsis ${!product.image ? 'ml-1' : ''}`}>
                            {product.name}
                        </p>
                    </div>
                );
            case "description":
                return (
                    <div className="flex flex-row gap-1 items-start w-full">
                        <p className="text-small text-default-400 line-clamp-3 overflow-hidden text-ellipsis">
                            {product.description}
                        </p>
                    </div>
                );
            case "price":
                const price = product.store_products?.[0]?.price;
                return (
                    <p className="text-small">
                        {price
                            ? `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "N/A"}
                    </p>
                );
            case "stock":
                const totalStock = (product.store_products || []).reduce((sum, sp) => sum + (sp.stock || 0), 0);
                return (
                    <Chip
                        className="capitalize"
                        color={totalStock > 0 ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                    >
                        {totalStock}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <VerticalDotsIcon className="text-default-300" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem key="view">Visualizar</DropdownItem>
                                <DropdownItem key="edit">Editar</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default: {
                const value = product[columnKey as keyof Product];
                if (typeof value === "string" || typeof value === "number") {
                    return value;
                }
                return "";
            }
        }
    }, []);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Pesquisar..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                                    Colunas
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {capitalize(column.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Button color="primary" onPress={onOpen} endContent={<PlusIcon />}>
                            Adicionar
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total de produtos: {products.length}</span>
                    <label className="flex items-center text-default-400 text-small">
                        Colunas por página:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, visibleColumns, onSearchChange, onRowsPerPageChange, products.length, hasSearchFilter]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} de ${filteredItems.length} selecionados`}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                        Voltar
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                        Próximo
                    </Button>
                </div>
            </div>
        );
    }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

    if (error) {
        return <div className="text-danger">{error}</div>;
    }

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <NewProductForm onClose={onClose} />
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Table
                isHeaderSticky
                aria-label="Product table with custom cells, pagination and sorting"
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[382px]",
                }}
                selectedKeys={selectedKeys}
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"Nenhum produto encontrado"} items={sortedItems}>
                    {(item) => (
                        <TableRow key={item.id} onClick={() => setSelectedProduct(item)}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}