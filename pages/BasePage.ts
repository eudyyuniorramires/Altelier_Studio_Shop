import {Page} from "@playwright/test";


export abstract class BasePage {

    protected page: Page;


    constructor(page : Page){

        this.page = page;

    }


    protected async goto( path:string):Promise<void>{

        await this.page.goto(path,{waitUntil:'domcontentloaded'});

    }

}