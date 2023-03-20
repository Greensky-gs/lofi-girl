import { BaseInteraction, ButtonBuilder, ButtonStyle } from 'discord.js';
import imports from './imports';

type command = {
    name: string;
    description: string;
    options?: Record<string, { name: string; description: string }>;
};
export type localizationsType<Key extends keyof typeof imports.fr & keyof typeof imports.en> = typeof imports.fr[Key] &
    typeof imports.en[Key];
export type localizationBuilder<
    Command extends keyof localizationsType<'commands'>,
    Locales extends string = keyof typeof imports
> = {
    name: Record<Locales, string>;
    description: Record<Locales, string>;
    options: Record<
        keyof localizationsType<'commands'>[Command]['options'],
        {
            name: Record<Locales, string>;
            description: Record<Locales, string>;
        }
    >;
};

export class Langs {
    private langs: Record<
        string,
        {
            commands: Record<string, command>;
            texts: Record<string, Record<string, string>>;
            buttons: Record<string, { label?: string; emoji?: string }>;
            selectors: Record<
                string,
                { placeholder?: string; content?: string; options?: { name?: string; emoji?: string }[] }
            >;
        }
    > = {
        fr: imports.fr,
        en: imports.en
    };
    private default: keyof typeof this.langs = 'en';

    constructor() {}

    public getCommand(locale: keyof typeof imports, key: keyof localizationsType<'commands'>): command {
        return (this.langs[locale] ?? this.langs[this.default]).commands[key];
    }
    public getText<
        Command extends keyof localizationsType<'texts'>,
        Text extends keyof localizationsType<'texts'>[Command]
    >(interaction: BaseInteraction, command: Command, text: Text, keys?: Record<string, string | number>): string {
        let content = (this.langs[interaction.locale] ?? this.langs[this.default]).texts[command][text as string];

        if (keys)
            Object.keys(keys).forEach((key) => {
                content = content.replace(new RegExp(`{{${key}}}`, 'g'), keys[key].toString());
            });

        return content;
    }
    public buildLocalizations<Command extends keyof localizationsType<'commands'>>(
        command: Command
    ): localizationBuilder<Command> {
        const names = {} as any;
        const descriptions = {} as any;
        const options = {} as any;

        Object.keys(imports).forEach((locale) => {
            if (locale === 'en') {
                ['en-US', 'en-GB'].forEach((loc) => {
                    names[loc] = imports[locale].commands[command].name;
                    descriptions[loc] = imports[locale].commands[command].description;

                    Object.keys(imports[locale].commands[command].options).forEach((optionName) => {
                        if (!options[optionName]) options[optionName] = { name: {}, description: {} };
                        options[optionName].name[loc] = imports[locale].commands[command].options[optionName].name;
                        options[optionName].description[loc] =
                            imports[locale].commands[command].options[optionName].description;
                    });
                });
            } else {
                names[locale] = imports[locale].commands[command].name;
                descriptions[locale] = imports[locale].commands[command].description;

                Object.keys(imports[locale].commands[command].options).forEach((optionName) => {
                    if (!options[optionName]) options[optionName] = { name: {}, description: {} };

                    options[optionName].name[locale] = imports[locale].commands[command].options[optionName].name;
                    options[optionName].description[locale] =
                        imports[locale].commands[command].options[optionName].description;
                });
            }
        });

        return {
            name: names,
            description: descriptions,
            options
        };
    }
    public getButton(
        interaction: BaseInteraction,
        button: keyof localizationsType<'buttons'>,
        data: { id?: string; emoji?: string; url?: string; style: keyof typeof ButtonStyle }
    ) {
        const btnData = (this.langs[interaction.locale] ?? this.langs[this.default]).buttons[button];
        if (!btnData.emoji && data.emoji) btnData.emoji = data.emoji;

        const btn = new ButtonBuilder().setStyle(ButtonStyle[data.style]);

        if (btnData.label) btn.setLabel(btnData.label);
        if (btnData.emoji) btn.setEmoji(btnData.emoji);
        if (data.id) btn.setCustomId(data.id);
        if (data.url) btn.setURL(data.url);

        return btn;
    }
    public getSelectorData<Selector extends keyof localizationsType<'selectors'>>(
        interaction: BaseInteraction,
        selector: Selector
    ): localizationsType<'selectors'>[Selector] {
        return (this.langs[interaction.locale] ?? this.langs[this.default])[selector];
    }
}
