"""
dfs_optimizer.py is a simple stand-alone command line utility to optimize lineups for DraftKings.

The utility uses integer programming to maximize projected points subject to DraftKings lineup constraints.

The input file must contain the following columns:

Name: The player's full name
Position: The rank of the player in their position
Projection: The player's projection
Salary: The players salary as a string. Can contain '$' and ',' characters


usage: dfs_optimizer.py [-h] file

Optimize DraftKings Lineup

positional arguments:
  file        Full file path to projections csv file

optional arguments:
  -h, --help  show this help message and exit

"""

import os
import argparse
import pandas as pd
import pulp as lp


def main():
    file = get_csv_file_path()
    data = get_data(file)
    lineup, totals = optimize(data)

    print('Optimal Lineup:')
    print(lineup)

    print('Totals:')
    print(totals)


def get_csv_file_path():
    """
    Get the full path to the input CSV file from the command line arguments.

    :raises: FileExistsError when the file does not exist

    :return: The csv file path
    """

    parser = argparse.ArgumentParser(description='Optimize DraftKings Lineup')
    parser.add_argument('file', type=str,
                        help='Full file path to projections csv file')

    args = parser.parse_args()
    file = args.file

    try:
        assert os.path.isfile(file)
    except AssertionError:
        raise FileExistsError('The file does not exist: {}'.format(file))

    return file


def get_data(file):
    """
    Read the csv file and pluck the relevant data into a Pandas DataFrame

    :param file: The csv file path

    :return: pandas.DataFrame(projection data)
    """

    # Read in CSV file
    df = pd.read_csv(file)

    # Select relevant rows
    df = df.loc[:, ['Name', 'Position', 'Projection', 'Salary']]

    # Parse the Salary column
    df['Salary'] = df['Salary'].replace('[\$,]', '', regex=True).astype(float)

    return df


def optimize(data):
    """
    Create and solve our integer program

    :param data: Input data with player names, projections, salary, etc.
    :type data: pandas.DataFrame

    :return: tuple of (lineup, totals), where lineup is a pandas.DataFrame of the players in our lineup, and totals
    is a pandas.Series of total Proj Pts and Salary
    """

    df = data

    # Create binary columns for each position to represent include/exclude in lineup
    df['QB'] = (df['Position'] == 'QB').astype(int)
    df['RB'] = (df['Position'] == 'RB').astype(int)
    df['WR'] = (df['Position'] == 'WR').astype(int)
    df['TE'] = (df['Position'] == 'TE').astype(int)
    df['DST'] = (df['Position'] == 'DST').astype(int)

    # Create binary variables and model
    x = lp.LpVariable.dicts('x', df.index, lowBound=0, upBound=1, cat='Integer')
    mod = lp.LpProblem('Lineup', lp.LpMaximize)

    # Objective function: Maximize Proj Pts
    objvals = {idx: df['Projection'][idx] for idx in df.index}
    mod += sum([x[idx] * objvals[idx] for idx in df.index])

    # Salary constraint: Total salary < 50,000
    mod += sum([x[idx] * df['Salary'][idx] for idx in df.index]) <= 50000

    # Total player constraint: Exactly 9 total players
    mod += sum([x[idx] for idx in df.index]) == 9

    # QB constraint: Exactly 1 QB
    mod += sum([x[idx] * df['QB'][idx] for idx in df.index]) == 1

    # RB constraint: Either 2 or 3 RBs (DraftKings uses a FLEX position)
    mod += sum([x[idx] * df['RB'][idx] for idx in df.index]) >= 2
    mod += sum([x[idx] * df['RB'][idx] for idx in df.index]) <= 3

    # WR constraint: Either 3 or 4 WRs (DraftKings uses a FLEX position)
    mod += sum([x[idx] * df['WR'][idx] for idx in df.index]) >= 3
    mod += sum([x[idx] * df['WR'][idx] for idx in df.index]) <= 4

    # TE constraint: Either 1 or 2 TEs (DraftKings uses a FLEX position)
    mod += sum([x[idx] * df['TE'][idx] for idx in df.index]) >= 1
    mod += sum([x[idx] * df['TE'][idx] for idx in df.index]) <= 2

    # DST constraint: Exactly 1 DST
    mod += sum([x[idx] * df['DST'][idx] for idx in df.index]) == 1

    # Solve lp
    mod.solve()

    # Output solution
    solution = []
    for idx in df.index:
        if x[idx].value() > 0:
            solution.append(idx)

    lineup = df.loc[solution, ['Name', 'Position', 'Projection', 'Salary']]
    totals = lineup.loc[:, ['Projection', 'Salary']].sum(axis=0)

    return lineup, totals


if __name__ == '__main__':
    main()
