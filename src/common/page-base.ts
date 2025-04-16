import { Page } from "@playwright/test";
import { workspaces } from "../utils/enums";

export class PageBase {
    readonly page: Page;
    readonly protocol: string = "https://";
    readonly workspace: string = process.env.WORKSPACE ?? workspaces.QA;
    readonly domain: string = "worldbinary.pro";
    protected path: string;

    constructor(page: Page, path: string) {
        this.page = page;
        this.path = path;
    }

    async openApplication(subpath?: string) {
        await this.page.goto(`${this.protocol}${this.workspace}.${this.domain}/${this.path}/${subpath ?? ''}`);
    }
}