import { Avatar, Image, Input } from '@heroui/react';
import { FaUsers } from 'react-icons/fa6';

interface LogoSectionProps {
    imageUri: string | undefined;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function LogoSection({ imageUri, handleImageChange }: LogoSectionProps) {
    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <h3 className="text-lg font-medium">Logo da Equipe</h3>
            {imageUri ? (
                <Image
                    src={imageUri}
                    alt="Logo da equipe"
                    className="rounded-md max-w-[200px] h-auto"
                    isZoomed
                />
            ) : (
                <Avatar
                    className="w-32 h-32 rounded-md"
                    showFallback
                    fallback={<FaUsers className="w-12 h-12 text-white" />}
                />
            )}
            <Input
                name="image"
                type="file"
                accept="image/jpeg,image/png"
                className="max-w-xs"
                description="Selecione uma imagem JPEG ou PNG (máx. 5MB)."
                onChange={handleImageChange}
            />
        </div>
    );
}