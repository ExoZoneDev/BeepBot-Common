import { dropRight, kebabCase, union } from 'lodash';

export type RoleType = 'internal' | 'custom';

export interface UserRole {
    id: string;
    name: string;
    type: RoleType;
    permissions: string[];
    inherits?: Role[];
    boost?: number;
}

export class Role {
    /**
     * The Id of the role.
     */
    private id: string;
    /**
     * The name of the role.
     */
    private name: string;
    /**
     * The slug name of the role.
     */
    private slug: string;
    /**
     * The type of the role.
     */
    private type: RoleType;
    /**
     * The raw permissions that the role has.
     */
    private rawPermissions: string[] = [];
    /**
     * The permissions which the role has access too.
     */
    private permissions: string[];
    /**
     * The roles which the role inherits.
     */
    private inherits: Role[] = [];
    /**
     * The XP boost which the role gives to users.
     */
    private pointBoost: number;

    constructor({ id, name, type, permissions, inherits = [], boost = 0 }: UserRole) {
        this.id = id;
        this.name = name;
        this.slug = kebabCase(name);
        this.type = type;
        this.permissions = permissions;
        this.rawPermissions = permissions;
        this.inherits = inherits;
        this.pointBoost = boost;

        // Apply all the permissions from the sub roles to this role.
        inherits.forEach(inherit => this.permissions = union(this.permissions, inherit.permissions));
    }

    /**
     * Check to see if the role has a given permission.
     */
    has(permission: string): boolean {
        const permissions = this.permissions;

        if (permissions.includes(permission)) {
            return true;
        }

        for (let i = 0, length = permissions.length; i < length; i++) {
            const perm = permissions[i].split(':');
            if (perm.includes('*')) {
                return new RegExp(`(${dropRight(perm, 1).join(':')}.*)`, 'i').test(permission);
            }
        }

        return false;
    }

    /**
     * Checks if the role has a permission in it's raw scopes.
     */
    hasInRaw(permission: string) {
        const permissions = this.rawPermissions;

        for (let i = 0, length = permissions.length; i < length; i++) {
            if (permissions[i] === permission) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the Id of the role.
     */
    getId(): string {
        return this.id;
    }

    /**
     * Get the name of the role.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Get the slug name for the role.
     */
    getSlug(): string {
        return this.slug;
    }

    /**
     * Get the XP boost for the user role.
     */
    getBoost(): number {
        return this.pointBoost;
    }

    /**
     * Get the permission for the role.
     */
    getPerms(): string[] {
        return this.permissions;
    }

    /**
     * Get the roles which the role inherits
     */
    getInherits(): Role[] {
        return this.inherits;
    }

    /**
     * Get the type of the role.
     */
    getType() {
        return this.type;
    }

    /**
     * Sets the XP boost for the user role.
     */
    setBoost(boost: number): number {
        this.pointBoost = boost;

        return this.pointBoost;
    }

    /**
     * Overrides the current permissions with new ones.
     */
    set(permissions: string[]): this {
        this.permissions = permissions;

        return this;
    }

    /**
     * Adds a permission to a role.
     */
    add(permission: string): void {
        if (!this.permissions.includes(permission)) {
            this.permissions.push(permission);
        }
    }

    /**
     * Removes a permission from a role.
     */
    remove(permission: string): void {
        this.permissions = this.permissions.filter(perm => perm !== permission);
    }
}
