## Read image data better

Found this reddit post that extracting data from images in a way that seems better that what I am doing. Might have to roll to something similar

https://www.reddit.com/r/artificial/comments/18e4a98/comment/kcmyhzt/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

> hi, was doing the same and not able to find out of box solution (with API) and created own:
>
> 1. pdf>image lib: pdf2image
> 2. optionally - lib: OpenCV to select text's areas
> 3. image>unstructured text (OCR, lib: PyTesseract or EasyOCR)
> 4. unstructured text > structured text (LLM eg Llama2 or chatgpt - page by page) - with prompts adjusted to layout complexity
