import { Button, CardFooter } from '@heroui/react';

interface FormFooterProps {
    onSave: () => void;
    onCancel: () => void;
}

export default function FormFooter({ onSave, onCancel }: FormFooterProps) {
    return (
        <CardFooter className="flex justify-end">
            <div className='flex flex-row gap-4'>
                <Button
                    radius="sm"
                    color="default"
                    onPress={onCancel}
                    aria-label="Cancel alterações"
                >
                    Cancelar
                </Button>
                <Button
                    radius="sm"
                    color="primary"
                    onPress={onSave}
                    aria-label="Save alterações"
                >
                    Salvar
                </Button>
            </div>
        </CardFooter>
    );
};