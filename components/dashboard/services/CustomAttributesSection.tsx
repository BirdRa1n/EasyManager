import { CustomAttribute } from '@/types/services';
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea } from '@heroui/react';

interface CustomAttributesSectionProps {
    customAttributes: CustomAttribute[];
    updateCustomAttribute: (index: number, field: 'key' | 'value', value: string) => void;
    addCustomAttribute: () => void;
    removeCustomAttribute: (index: number) => void;
}

export default function CustomAttributesSection({
    customAttributes,
    updateCustomAttribute,
    addCustomAttribute,
    removeCustomAttribute,
}: CustomAttributesSectionProps) {
    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold p-2">Anotações Personalizadas</h2>
                <Button size="sm" onPress={addCustomAttribute} aria-label="Adicionar novo atributo personalizado">
                    Adicionar
                </Button>
            </div>
            {customAttributes.length > 0 ? (
                <Table aria-label="Atributos personalizados" className='mt-4' removeWrapper>
                    <TableHeader>
                        <TableColumn>ETIQUETA</TableColumn>
                        <TableColumn>CONTEUDO</TableColumn>
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
                <p className="text-small ml-3 text-default-400">Nenhum anotação personalizada adicionada.</p>
            )}
        </div>
    );
}