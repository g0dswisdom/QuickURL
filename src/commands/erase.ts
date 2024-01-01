import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import Database from '../libs/database'

export const data = new SlashCommandBuilder()
    .setName('erase')
    .setDescription('Deletes an URL!')
    .addStringOption(option =>
        option.setName('hash')
            .setDescription("The URL's hash")
            .setRequired(true))
export async function execute(interaction: CommandInteraction) {
    const user = interaction.user.id;
    const hash = interaction.options.get('hash')?.value as string;
    try {
        const owner = await Database.getOwner(hash);
        if (owner == user) {
            try {
                await Database.deleteUrl(user, hash);
            } catch (e: any) {
                console.log(e);
                await interaction.reply({ content: 'There was an error while trying to delete the URL', ephemeral: true });
            }
            await interaction.reply({ content: 'URL deleted successfully!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'You are not the owner of this URL!', ephemeral: true });
        }
    } catch (e: any) {
        console.log(e);
        await interaction.reply({ content: 'There was an error while trying to get the owner', ephemeral: true });
    }
}