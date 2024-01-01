import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { url } from '../config.json';

export const data = new SlashCommandBuilder()
    .setName('urlcount')
    .setDescription('Get the total count of shortened URLs')
export async function execute(interaction: CommandInteraction) {
    await axios({
        method: 'GET',
        url: `${url}/count`,
    }).then((resp) => {
        let count = resp.data.count;
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('URL Count')
            .setDescription(`The current URL count is ${count}`)
        return interaction.reply({embeds: [embed]});
    }).catch((err) => {
        return interaction.reply({content: 'There was an error while trying to get the URL count', ephemeral: true})
    });
}