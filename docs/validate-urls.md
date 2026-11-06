# Validar URLs em qualquer ambiente

```bash
npm run validate-urls <lista.csv> base=https://hml.exemplo.com.br [paralelo=8] [saida=relatorio.csv]
```

- **Regra:** cada URL precisa responder **200**, ou **301** para um destino que responde **200**, num único salto e preservando a query string.
- **Cadeia:** redirect em cadeia, 302 e perda de query string contam como falha.
- **Parâmetro de teste:** o script acrescenta `utm_source=validacao-urls` a cada URL, para conferir se a query sobrevive ao redirect.
- **URLs de produção:** URLs completas são reapontadas para o `base`, então a mesma lista (exemplo em [exemplos/urls-antigas.csv](exemplos/urls-antigas.csv)) serve para HML e PRD.
- **Resultado:** o script sai com código 1 se houver falha, e pode barrar a virada de uma onda.

Os únicos redirects que o site responde são os da política de URL da propriedade (barra final e posts planos, `src/lib/urlPolicy.ts`). Não existe mais a coleção `redirects` no CMS: uma URL antiga que mudou de endereço precisa ser tratada fora do CMS (CDN ou `redirects.ts` do Next).
