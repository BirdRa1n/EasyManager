import { Button } from '@heroui/react';

interface FormFooterProps {
    loading: boolean;
    onClose: () => void;
}

export default function FormFooter({ loading, onClose }: FormFooterProps) {
    return (
        <div className="flex justify-end gap-3 mt-6 w-full">
            <Button
                radius="sm"
                color="default"
                onPress={onClose}
                aria-label="Cancelar"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
                Cancelar
            </Button>
            <Button
                isDisabled={loading}
                isLoading={loading}
                type="submit"
                radius="sm"
                color="primary"
                aria-label="Criar Equipe"
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                Criar Equipe
            </Button>
        </div>
    );
}