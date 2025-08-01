## New Data

notes/torchcell.scratch.load_batch_005.md
torchcell/scratch/load_batch_005.py

This is where we use transforms. You can see how we used to use transforms when we weren't using `coo` data formatting
experiments/005-kuzmin2018-tmi/scripts/dango.py
torchcell/transforms/regression_to_classification_coo.py
tests/torchcell/transforms/test_regression_to_classification_coo.py

## Old Transforms With Named Phenotypes

torchcell/transforms/regression_to_classification.py
tests/torchcell/transforms/test_regression_to_classification.py

## Old Test Results

Results from test_regression_to_classification.py

```bash
(torchcell) michaelvolk@M1-MV torchcell % python -m pytest /Users/michaelvolk/Documents/projects/torchcell/tests/torchcell/transforms/test_regression_to_classification.py -v
===================================================================== test session starts =====================================================================
platform darwin -- Python 3.11.11, pytest-8.3.4, pluggy-1.5.0 -- /Users/michaelvolk/opt/miniconda3/envs/torchcell/bin/python
cachedir: .pytest_cache
rootdir: /Users/michaelvolk/Documents/projects/torchcell
configfile: pyproject.toml
plugins: anyio-4.8.0, hydra-core-1.3.2
collected 22 items                                                                                                                                            

tests/torchcell/transforms/test_regression_to_classification.py::TestLabelNormalizationTransform::test_minmax_normalization PASSED                      [  4%]
tests/torchcell/transforms/test_regression_to_classification.py::TestLabelNormalizationTransform::test_standard_normalization PASSED                    [  9%]
tests/torchcell/transforms/test_regression_to_classification.py::TestLabelN