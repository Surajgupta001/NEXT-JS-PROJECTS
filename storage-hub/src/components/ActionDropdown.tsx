'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { actionsDropdownItems } from '../../constants';
import { constructDownloadUrl } from '@/lib/utils';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { renameFile, updateFileUsers, deleteFile } from '@/lib/actions/file.actions';
import { FileDetails, ShareInput } from './ActionsModalContent';
import { toast } from 'sonner';

function ActionDropdown({ file }: { file: FileDocument }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [action, setAction] = useState<ActionType | null>(null);
    const [name, setName] = useState(file.name);
    const [isLoading, setIsLoading] = useState(false);
    const [emails, setEmails] = useState<string[]>([]);

    const path = usePathname();

    const closeAllModals = () => {
        setIsModalOpen(false);
        setIsDropdownOpen(false);
        setAction(null);
        setName(file.name);
        setEmails([]);
    };

    const handleAction = async () => {
        if (!action) return;

        setIsLoading(true);

        try {
            let success = false;

            const actions = {
                rename: () => renameFile({
                    fileId: file.$id,
                    name: name,
                    extension: file.extension,
                    path: path
                }),

                share: () => updateFileUsers({
                    fileId: file.$id,
                    emails: emails,
                    path
                }),

                delete: () => deleteFile({
                    fileId: file.$id,
                    bucketFileId: file.bucketFileId,
                    path
                }),
            };

            const actionFn = actions[action.value as keyof typeof actions];
            if (actionFn) {
                success = Boolean(await actionFn());
            }

            if (success) {
                closeAllModals();
            }
        } catch {
            toast.error("Action failed", {
                description: `Could not ${action.label.toLowerCase()} ${file.name}.`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveUser = async (email: string) => {
        const updatedEmails = file.users.filter(e => e !== email);

        try {
            const success = await updateFileUsers({
                fileId: file.$id,
                emails: updatedEmails,
                path
            });

            if (success) {
                setEmails(updatedEmails);
            }
        } catch {
            toast.error("Action failed", {
                description: `Could not remove ${email}.`,
            });
        }

        closeAllModals();
    };

    const renderDialogContent = () => {
        if (!action) return null;

        const { value, label } = action;

        return (
            <DialogContent className="shad-dialog">
                <DialogHeader className="flex flex-col gap-3">
                    <DialogTitle className="text-center text-light-100">
                        {label}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Modal dialog for performing the {label} action on the file.
                    </DialogDescription>
                    {value === "rename" && (
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    {value === "details" && <FileDetails file={file} />}
                    {value === "share" && (
                        <ShareInput
                            file={file}
                            onInputChange={setEmails}
                            onRemove={handleRemoveUser}
                        />
                    )}
                    {value === "delete" && (
                        <p className="delete-confirmation">
                            Are you sure you want to delete{` `}
                            <span className="delete-file-name">{file.name}</span>?
                        </p>
                    )}
                </DialogHeader>
                {["rename", "delete", "share"].includes(value) && (
                    <DialogFooter className="flex flex-col gap-3 md:flex-row">
                        <Button onClick={closeAllModals} className="modal-cancel-button">
                            Cancel
                        </Button>
                        <Button onClick={handleAction} className="modal-submit-button" disabled={isLoading}>
                            <p className="capitalize">{value}</p>
                            {isLoading && (
                                <Image
                                    src="/assets/icons/loader.svg"
                                    alt="loader"
                                    width={24}
                                    height={24}
                                    className="animate-spin"
                                />
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        );
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger className="shad-no-focus">
                    <Image
                        src="/assets/icons/dots.svg"
                        alt="dots"
                        width={34}
                        height={34}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="truncate max-w-50">
                        {file.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actionsDropdownItems.map((actionItem) => (
                        <DropdownMenuItem
                            key={actionItem.value}
                            className="shad-dropdown-item"
                            onClick={() => {
                                setAction(actionItem);

                                if (
                                    ["rename", "share", "delete", "details"].includes(
                                        actionItem.value,
                                    )
                                ) {
                                    setIsModalOpen(true);
                                }
                            }}
                        >
                            {actionItem.value === "download" ? (
                                <Link
                                    href={constructDownloadUrl(file.bucketFileId)}
                                    download={file.name}
                                    className="flex items-center gap-2"
                                >
                                    <Image
                                        src={actionItem.icon}
                                        alt={actionItem.label}
                                        width={30}
                                        height={30}
                                    />
                                    {actionItem.label}
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={actionItem.icon}
                                        alt={actionItem.label}
                                        width={30}
                                        height={30}
                                    />
                                    {actionItem.label}
                                </div>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {renderDialogContent()}
        </Dialog>
    );
}

export default ActionDropdown
