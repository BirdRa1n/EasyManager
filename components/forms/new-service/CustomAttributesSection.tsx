import { CustomAttribute } from '@/types/services';
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea } from '@heroui/react';

interface CustomAttributesSectionProps {
    customAttributes: CustomAttribute[];
    addCustomAttribute: () => void;
    updateCustomAttribute: (index: number, field: 'key' | 'value', value: string) => void;
    removeCustomAttribute: (index: number) => void;
}

export default function CustomAttributesSection({
    customAttributes,
    addCustomAttribute,
    updateCustomAttribute,
    removeCustomAttribute,
}: CustomAttributesSectionProps) {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <p className="text-default-600 text-sm mb-2">Anotações personalizadas</p>
                <Button
                    size="sm"
                    onPress={addCustomAttribute}
                    aria-label="Adicionar novo atributo personalizado"
                >
                    Adicionar
                </Button>
            </div>
            {customAttributes.length > 0 ? (
                <Table shadow="none" aria-label="Anotações personalizadas">
                    <TableHeader>
                        <TableColumn>ETIQUETA</TableColumn>
                        <TableColumn>CONTEÚDO</TableColumn>
                        <TableColumn align="center">AÇÕES</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {customAttributes.map((attr, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Textarea
                                        value={attr.key}
                                        onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)}
                                        placeholder="Etiqueta"
                                        aria-label={`Título ${index + 1}`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Textarea
                                        value={attr.value}
                                        onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                                        placeholder="Valor"
                                        aria-label={`Valor do atributo ${index + 1}`}
                                    />
                                </TableCell>
                                <TableCell className="flex justify-center">
                                    <Button
                                        size="sm"
                                        color="danger"
                                        onPress={() => removeCustomAttribute(index)}
                                        aria-label={`Remover atributo ${index + 1}`}
                                    >
                                        Remover
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-small text-default-400">Nenhum atributo personalizado adicionado.</p>
            )}
        </div>
    );
}