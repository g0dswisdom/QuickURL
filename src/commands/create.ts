import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { url } from '../config.json';
axios.defaults.withCredentials = false;

export const data = new SlashCommandBuilder()
    .setName('create')
    .setDescription('Shortens an URL!')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('Your URL')
            .setRequired(true))
export async function execute(interaction: CommandInteraction) {
    const urlv = interaction.options.get('url')?.value;
    await axios({
        method: 'POST',
        url: `${url}/create`,
        data: {
            'url': urlv,
            'owner': interaction.user.id
        }
    }).then((resp) => {
        let hash = resp.data.hash;
        return interaction.reply({content: `${url}/url?link=${hash}`, ephemeral: true});
    }).catch((err) => {
        return interaction.reply({content: 'There was an error while trying to shorten your URL', ephemeral: true})
    });
}