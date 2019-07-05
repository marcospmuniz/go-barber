import File from '../models/File';

class FileController {
  async store(req, res) {
    // req.file retorna todas as informações do arquivo enviado.
    // quando for vários arquivos, o acesso passa a ser req.files
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
