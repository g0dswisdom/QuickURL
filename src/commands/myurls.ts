import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { url } from '../config.json';

export const data = new SlashCommandBuilder()
    .setName('myurls')
    .setDescription('Displays a list of the URLs created by you')
export async function execute(interaction: CommandInteraction) {
    await axios({
        method: 'GET',
        url: `${url}/userurls`,
        data: {
            'user': interaction.user.id,
        }
    }).then((resp) => {
        const urls: { id: number, original_url: string, shortened_url: string }[] = resp.data;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Your URLs')
            .setDescription('List of the URLs you created')
            .addFields(
                urls.map(({ id, original_url, shortened_url }) => ({
                    name: `URL ${id}`,
                    value: `Original: [Click here](${original_url})\nShortened: [Click here](${shortened_url})`,
                }))
            );

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }).catch((err) => {
        return interaction.reply({content: 'There was an error while trying to get your URL count', ephemeral: true})
    });
}