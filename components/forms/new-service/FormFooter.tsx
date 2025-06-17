import { Button } from '@heroui/react';

interface FormFooterProps {
    loading: boolean;
}

export default function FormFooter({ loading }: FormFooterProps) {
    return (
        <div className="flex justify-end w-full">
            <Button color="primary" type="submit" isLoading={loading} isDisabled={loading}>
                Adicionar
            </Button>
        </div>
    );
}